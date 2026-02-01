import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, or, like, isNull, desc, asc, count } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission, hasPermission } from '../middleware/permissions.js';
import logger from '../lib/logger.js';

const courses = new Hono();

courses.use('*', authMiddleware);

// Validators
const createCourseSchema = z.object({
  code: z.string().min(2, 'رمز المقرر مطلوب').max(20),
  name: z.string().min(2, 'اسم المقرر مطلوب').max(255),
  description: z.string().max(1000).optional(),
  creditHours: z.number().min(1).max(6).default(3),
  majorId: z.string().min(1, 'التخصص مطلوب'),
  levelId: z.string().min(1, 'المستوى مطلوب'),
  instructorId: z.string().optional(),
  semester: z.enum(['first', 'second', 'summer']),
  academicYear: z.string().regex(/^\d{4}$/, 'السنة غير صالحة'),
});

const updateCourseSchema = createCourseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const queryCourseSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  majorId: z.string().optional(),
  levelId: z.string().optional(),
  instructorId: z.string().optional(),
  semester: z.string().optional(),
  academicYear: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'code', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// GET /courses - قائمة المقررات
// ============================================
courses.get('/', requirePermission('view_courses'), zValidator('query', queryCourseSchema), async (c) => {
  const user = c.get('user');
  const query = c.req.valid('query');
  const { page, limit, search, majorId, levelId, instructorId, semester, academicYear, isActive, sortBy, sortOrder } = query;

  const conditions = [isNull(schema.courses.deletedAt)];

  // If user doesn't have view_all_courses, filter by instructor
  if (!hasPermission(user.permissions, 'view_all_courses')) {
    conditions.push(eq(schema.courses.instructorId, user.userId));
  }

  if (search) {
    conditions.push(or(like(schema.courses.name, `%${search}%`), like(schema.courses.code, `%${search}%`))!);
  }
  if (majorId) conditions.push(eq(schema.courses.majorId, majorId));
  if (levelId) conditions.push(eq(schema.courses.levelId, levelId));
  if (instructorId) conditions.push(eq(schema.courses.instructorId, instructorId));
  if (semester) conditions.push(eq(schema.courses.semester, semester));
  if (academicYear) conditions.push(eq(schema.courses.academicYear, academicYear));
  if (isActive !== undefined) conditions.push(eq(schema.courses.isActive, isActive));

  const [{ total }] = await db
    .select({ total: count() })
    .from(schema.courses)
    .where(and(...conditions));

  const offset = (page - 1) * limit;
  const orderFn = sortOrder === 'asc' ? asc : desc;

  const coursesList = await db.query.courses.findMany({
    where: and(...conditions),
    with: {
      major: true,
      level: true,
      instructor: { columns: { id: true, fullName: true, email: true } },
      files: { where: isNull(schema.files.deletedAt) },
    },
    limit,
    offset,
    orderBy: [orderFn(schema.courses[sortBy as keyof typeof schema.courses] as any)],
  });

  const data = coursesList.map((course) => ({
    id: course.id,
    code: course.code,
    name: course.name,
    description: course.description,
    creditHours: course.creditHours,
    majorId: course.majorId,
    majorName: course.major?.name,
    levelId: course.levelId,
    levelName: course.level?.name,
    instructorId: course.instructorId,
    instructorName: course.instructor?.fullName,
    semester: course.semester,
    academicYear: course.academicYear,
    isActive: course.isActive,
    filesCount: course.files?.length || 0,
    createdAt: course.createdAt,
  }));

  return c.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
  });
});

// ============================================
// GET /courses/:id - مقرر محدد
// ============================================
courses.get('/:id', requirePermission('view_courses'), async (c) => {
  const id = c.req.param('id');

  const course = await db.query.courses.findFirst({
    where: and(eq(schema.courses.id, id), isNull(schema.courses.deletedAt)),
    with: {
      major: true,
      level: true,
      instructor: { columns: { id: true, fullName: true, email: true } },
      files: { where: isNull(schema.files.deletedAt) },
    },
  });

  if (!course) {
    return c.json({ success: false, error: 'المقرر غير موجود' }, 404);
  }

  return c.json({ success: true, data: course });
});

// ============================================
// POST /courses - إنشاء مقرر
// ============================================
courses.post('/', requirePermission('add_course'), zValidator('json', createCourseSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  // Check if code already exists
  const existing = await db.query.courses.findFirst({
    where: and(eq(schema.courses.code, data.code), isNull(schema.courses.deletedAt)),
  });

  if (existing) {
    return c.json({ success: false, error: 'رمز المقرر موجود مسبقاً' }, 400);
  }

  const [newCourse] = await db
    .insert(schema.courses)
    .values({
      code: data.code,
      name: data.name,
      description: data.description,
      creditHours: data.creditHours,
      majorId: data.majorId,
      levelId: data.levelId,
      instructorId: data.instructorId,
      semester: data.semester,
      academicYear: data.academicYear,
    })
    .returning();

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'create',
    entityType: 'course',
    entityId: newCourse.id,
    newValue: { code: data.code, name: data.name },
  });

  logger.info(`Course created: ${data.code} by ${user.email}`);

  return c.json({ success: true, data: newCourse, message: 'تم إنشاء المقرر بنجاح' }, 201);
});

// ============================================
// PUT /courses/:id - تحديث مقرر
// ============================================
courses.put('/:id', requirePermission('edit_course'), zValidator('json', updateCourseSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const data = c.req.valid('json');

  const course = await db.query.courses.findFirst({
    where: and(eq(schema.courses.id, id), isNull(schema.courses.deletedAt)),
  });

  if (!course) {
    return c.json({ success: false, error: 'المقرر غير موجود' }, 404);
  }

  // Check code uniqueness if changed
  if (data.code && data.code !== course.code) {
    const existing = await db.query.courses.findFirst({
      where: and(eq(schema.courses.code, data.code), isNull(schema.courses.deletedAt)),
    });
    if (existing) {
      return c.json({ success: false, error: 'رمز المقرر موجود مسبقاً' }, 400);
    }
  }

  const [updated] = await db
    .update(schema.courses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.courses.id, id))
    .returning();

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'update',
    entityType: 'course',
    entityId: id,
    oldValue: { code: course.code, name: course.name },
    newValue: data,
  });

  logger.info(`Course updated: ${id} by ${user.email}`);

  return c.json({ success: true, data: updated, message: 'تم تحديث المقرر بنجاح' });
});

// ============================================
// DELETE /courses/:id - حذف مقرر
// ============================================
courses.delete('/:id', requirePermission('delete_course'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const course = await db.query.courses.findFirst({
    where: and(eq(schema.courses.id, id), isNull(schema.courses.deletedAt)),
  });

  if (!course) {
    return c.json({ success: false, error: 'المقرر غير موجود' }, 404);
  }

  await db.update(schema.courses).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(schema.courses.id, id));

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'delete',
    entityType: 'course',
    entityId: id,
    oldValue: { code: course.code, name: course.name },
  });

  logger.info(`Course deleted: ${id} by ${user.email}`);

  return c.json({ success: true, message: 'تم حذف المقرر بنجاح' });
});

export default courses;
