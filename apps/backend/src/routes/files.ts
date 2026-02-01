import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, or, like, isNull, desc, asc, count, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission, hasPermission } from '../middleware/permissions.js';
import logger from '../lib/logger.js';
import { uploadFile, deleteFile } from '../lib/supabase.js';
import { nanoid } from 'nanoid';

const files = new Hono();

files.use('*', authMiddleware);

// Validators
const queryFilesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  courseId: z.string().optional(),
  category: z.enum(['lecture', 'assignment', 'exam', 'resource', 'other']).optional(),
  uploaderId: z.string().optional(),
  sortBy: z.enum(['name', 'size', 'downloadsCount', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const uploadFileSchema = z.object({
  name: z.string().min(1, 'اسم الملف مطلوب'),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().min(1),
  url: z.string().min(1),
  storagePath: z.string().optional(),
  courseId: z.string().optional(),
  category: z.enum(['lecture', 'assignment', 'exam', 'resource', 'other']).default('other'),
  description: z.string().optional(),
});

// ============================================
// GET /files - قائمة الملفات
// ============================================
files.get('/', requirePermission('view_files'), zValidator('query', queryFilesSchema), async (c) => {
  const user = c.get('user');
  const query = c.req.valid('query');
  const { page, limit, search, courseId, category, uploaderId, sortBy, sortOrder } = query;

  const conditions = [isNull(schema.files.deletedAt)];

  // Filter by uploader if user doesn't have view_all_files
  if (!hasPermission(user.permissions, 'view_all_files')) {
    conditions.push(eq(schema.files.uploaderId, user.userId));
  }

  if (search) {
    conditions.push(or(like(schema.files.name, `%${search}%`), like(schema.files.originalName, `%${search}%`))!);
  }
  if (courseId) conditions.push(eq(schema.files.courseId, courseId));
  if (category) conditions.push(eq(schema.files.category, category));
  if (uploaderId) conditions.push(eq(schema.files.uploaderId, uploaderId));

  const [{ total }] = await db.select({ total: count() }).from(schema.files).where(and(...conditions));

  const offset = (page - 1) * limit;
  const orderFn = sortOrder === 'asc' ? asc : desc;

  const filesList = await db.query.files.findMany({
    where: and(...conditions),
    with: {
      course: { columns: { id: true, name: true, code: true } },
      uploader: { columns: { id: true, fullName: true } },
    },
    limit,
    offset,
    orderBy: [orderFn(schema.files[sortBy as keyof typeof schema.files] as any)],
  });

  const data = filesList.map((file) => ({
    id: file.id,
    name: file.name,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    url: file.url,
    courseId: file.courseId,
    courseName: file.course?.name,
    courseCode: file.course?.code,
    uploaderId: file.uploaderId,
    uploaderName: file.uploader?.fullName,
    category: file.category,
    downloads: file.downloadsCount,
    createdAt: file.createdAt,
  }));

  return c.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
  });
});

// ============================================
// GET /files/stats - إحصائيات الملفات
// ============================================
files.get('/stats', requirePermission('view_files'), async (c) => {
  const [stats] = await db
    .select({
      totalFiles: count(),
      totalSize: sql<number>`COALESCE(SUM(${schema.files.size}), 0)`,
      totalDownloads: sql<number>`COALESCE(SUM(${schema.files.downloadsCount}), 0)`,
    })
    .from(schema.files)
    .where(isNull(schema.files.deletedAt));

  // Get counts by category
  const byCategory = await db
    .select({
      category: schema.files.category,
      count: count(),
    })
    .from(schema.files)
    .where(isNull(schema.files.deletedAt))
    .groupBy(schema.files.category);

  return c.json({
    success: true,
    data: {
      totalFiles: stats.totalFiles,
      totalSize: stats.totalSize,
      totalDownloads: stats.totalDownloads,
      byCategory: byCategory.reduce((acc, item) => {
        if (item.category) acc[item.category] = item.count;
        return acc;
      }, {} as Record<string, number>),
    },
  });
});

// ============================================
// GET /files/:id - ملف محدد
// ============================================
files.get('/:id', requirePermission('view_files'), async (c) => {
  const id = c.req.param('id');

  const file = await db.query.files.findFirst({
    where: and(eq(schema.files.id, id), isNull(schema.files.deletedAt)),
    with: {
      course: true,
      uploader: { columns: { id: true, fullName: true, email: true } },
    },
  });

  if (!file) {
    return c.json({ success: false, error: 'الملف غير موجود' }, 404);
  }

  return c.json({ success: true, data: file });
});

// ============================================
// POST /files/upload - رفع ملف إلى Supabase Storage
// ============================================
files.post('/upload', requirePermission('upload_file'), async (c) => {
  const user = c.get('user');
  
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string || file?.name;
    const courseId = formData.get('courseId') as string || undefined;
    const category = (formData.get('category') as string || 'other') as 'lecture' | 'assignment' | 'exam' | 'resource' | 'other';
    const description = formData.get('description') as string || undefined;

    if (!file) {
      return c.json({ success: false, error: 'الملف مطلوب' }, 400);
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ success: false, error: 'حجم الملف يتجاوز الحد المسموح (50MB)' }, 400);
    }

    // Generate unique path
    const ext = file.name.split('.').pop() || '';
    const uniqueId = nanoid(10);
    const storagePath = `${category}/${uniqueId}.${ext}`;

    // Upload to Supabase Storage
    const uploadResult = await uploadFile(file, storagePath, file.type);

    if (!uploadResult) {
      return c.json({ success: false, error: 'فشل في رفع الملف' }, 500);
    }

    // Save file metadata to database
    const [newFile] = await db
      .insert(schema.files)
      .values({
        name: name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: uploadResult.url,
        storagePath: uploadResult.path,
        courseId: courseId || null,
        category: category,
        description: description,
        uploaderId: user.userId,
      })
      .returning();

    await db.insert(schema.auditLogs).values({
      userId: user.userId,
      action: 'upload',
      entityType: 'file',
      entityId: newFile.id,
      newValue: { name: name, size: file.size },
    });

    logger.info(`File uploaded to storage: ${name} by ${user.email}`);

    return c.json({ success: true, data: newFile, message: 'تم رفع الملف بنجاح' }, 201);
  } catch (error) {
    logger.error({ error }, 'File upload error');
    return c.json({ success: false, error: 'حدث خطأ أثناء رفع الملف' }, 500);
  }
});

// ============================================
// POST /files - رفع ملف (metadata only - للتوافق مع الإصدارات القديمة)
// ============================================
files.post('/', requirePermission('upload_file'), zValidator('json', uploadFileSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  const [newFile] = await db
    .insert(schema.files)
    .values({
      name: data.name,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      url: data.url,
      storagePath: data.storagePath,
      courseId: data.courseId,
      category: data.category,
      description: data.description,
      uploaderId: user.userId,
    })
    .returning();

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'upload',
    entityType: 'file',
    entityId: newFile.id,
    newValue: { name: data.name, size: data.size },
  });

  logger.info(`File uploaded: ${data.name} by ${user.email}`);

  return c.json({ success: true, data: newFile, message: 'تم رفع الملف بنجاح' }, 201);
});

// ============================================
// POST /files/:id/download - تسجيل تحميل
// ============================================
files.post('/:id/download', requirePermission('download_file'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const file = await db.query.files.findFirst({
    where: and(eq(schema.files.id, id), isNull(schema.files.deletedAt)),
  });

  if (!file) {
    return c.json({ success: false, error: 'الملف غير موجود' }, 404);
  }

  // Increment download count
  await db
    .update(schema.files)
    .set({ downloadsCount: sql`${schema.files.downloadsCount} + 1` })
    .where(eq(schema.files.id, id));

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'download',
    entityType: 'file',
    entityId: id,
  });

  return c.json({ success: true, data: { url: file.url }, message: 'تم تسجيل التحميل' });
});

// ============================================
// DELETE /files/:id - حذف ملف
// ============================================
files.delete('/:id', requirePermission('delete_file'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const file = await db.query.files.findFirst({
    where: and(eq(schema.files.id, id), isNull(schema.files.deletedAt)),
  });

  if (!file) {
    return c.json({ success: false, error: 'الملف غير موجود' }, 404);
  }

  // Check ownership if not admin
  if (!hasPermission(user.permissions, 'view_all_files') && file.uploaderId !== user.userId) {
    return c.json({ success: false, error: 'ليس لديك صلاحية حذف هذا الملف' }, 403);
  }

  // Delete from Supabase Storage if storagePath exists
  if (file.storagePath) {
    await deleteFile(file.storagePath);
  }

  await db.update(schema.files).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(schema.files.id, id));

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'delete',
    entityType: 'file',
    entityId: id,
    oldValue: { name: file.name },
  });

  logger.info(`File deleted: ${id} by ${user.email}`);

  return c.json({ success: true, message: 'تم حذف الملف بنجاح' });
});

export default files;
