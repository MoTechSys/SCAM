import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, isNotNull, desc, count } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import logger from '../lib/logger.js';

const trash = new Hono();

trash.use('*', authMiddleware);

// ============================================
// GET /trash - المحذوفات
// ============================================
trash.get('/', requirePermission('view_trash'), async (c) => {
  const entityType = c.req.query('entityType');

  const result: any = { users: [], roles: [], courses: [], files: [] };

  // Deleted users
  if (!entityType || entityType === 'users') {
    result.users = await db.query.users.findMany({
      where: isNotNull(schema.users.deletedAt),
      with: { role: true, major: true },
      orderBy: [desc(schema.users.deletedAt)],
      limit: 50,
    });
  }

  // Deleted roles
  if (!entityType || entityType === 'roles') {
    result.roles = await db.query.roles.findMany({
      where: isNotNull(schema.roles.deletedAt),
      orderBy: [desc(schema.roles.deletedAt)],
      limit: 50,
    });
  }

  // Deleted courses
  if (!entityType || entityType === 'courses') {
    result.courses = await db.query.courses.findMany({
      where: isNotNull(schema.courses.deletedAt),
      with: { major: true, level: true },
      orderBy: [desc(schema.courses.deletedAt)],
      limit: 50,
    });
  }

  // Deleted files
  if (!entityType || entityType === 'files') {
    result.files = await db.query.files.findMany({
      where: isNotNull(schema.files.deletedAt),
      with: { course: true, uploader: { columns: { id: true, fullName: true } } },
      orderBy: [desc(schema.files.deletedAt)],
      limit: 50,
    });
  }

  // Count totals
  const [{ usersCount }] = await db.select({ usersCount: count() }).from(schema.users).where(isNotNull(schema.users.deletedAt));
  const [{ rolesCount }] = await db.select({ rolesCount: count() }).from(schema.roles).where(isNotNull(schema.roles.deletedAt));
  const [{ coursesCount }] = await db.select({ coursesCount: count() }).from(schema.courses).where(isNotNull(schema.courses.deletedAt));
  const [{ filesCount }] = await db.select({ filesCount: count() }).from(schema.files).where(isNotNull(schema.files.deletedAt));

  return c.json({
    success: true,
    data: result,
    counts: {
      users: usersCount,
      roles: rolesCount,
      courses: coursesCount,
      files: filesCount,
      total: usersCount + rolesCount + coursesCount + filesCount,
    },
  });
});

// ============================================
// POST /trash/restore - استعادة عنصر
// ============================================
const restoreSchema = z.object({
  entityType: z.enum(['user', 'role', 'course', 'file']),
  entityId: z.string().min(1),
});

trash.post('/restore', requirePermission('restore_from_trash'), zValidator('json', restoreSchema), async (c) => {
  const user = c.get('user');
  const { entityType, entityId } = c.req.valid('json');

  let restored = false;

  switch (entityType) {
    case 'user':
      const userResult = await db
        .update(schema.users)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(and(eq(schema.users.id, entityId), isNotNull(schema.users.deletedAt)))
        .returning();
      restored = userResult.length > 0;
      break;

    case 'role':
      const roleResult = await db
        .update(schema.roles)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(and(eq(schema.roles.id, entityId), isNotNull(schema.roles.deletedAt)))
        .returning();
      restored = roleResult.length > 0;
      break;

    case 'course':
      const courseResult = await db
        .update(schema.courses)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(and(eq(schema.courses.id, entityId), isNotNull(schema.courses.deletedAt)))
        .returning();
      restored = courseResult.length > 0;
      break;

    case 'file':
      const fileResult = await db
        .update(schema.files)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(and(eq(schema.files.id, entityId), isNotNull(schema.files.deletedAt)))
        .returning();
      restored = fileResult.length > 0;
      break;
  }

  if (!restored) {
    return c.json({ success: false, error: 'العنصر غير موجود في المحذوفات' }, 404);
  }

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'restore',
    entityType,
    entityId,
  });

  logger.info(`Restored ${entityType}: ${entityId} by ${user.email}`);

  return c.json({ success: true, message: 'تم استعادة العنصر بنجاح' });
});

// ============================================
// DELETE /trash/permanent - حذف نهائي
// ============================================
trash.delete('/permanent', requirePermission('permanent_delete'), zValidator('json', restoreSchema), async (c) => {
  const user = c.get('user');
  const { entityType, entityId } = c.req.valid('json');

  let deleted = false;

  switch (entityType) {
    case 'user':
      const userResult = await db
        .delete(schema.users)
        .where(and(eq(schema.users.id, entityId), isNotNull(schema.users.deletedAt)))
        .returning();
      deleted = userResult.length > 0;
      break;

    case 'role':
      const roleResult = await db
        .delete(schema.roles)
        .where(and(eq(schema.roles.id, entityId), isNotNull(schema.roles.deletedAt)))
        .returning();
      deleted = roleResult.length > 0;
      break;

    case 'course':
      const courseResult = await db
        .delete(schema.courses)
        .where(and(eq(schema.courses.id, entityId), isNotNull(schema.courses.deletedAt)))
        .returning();
      deleted = courseResult.length > 0;
      break;

    case 'file':
      const fileResult = await db
        .delete(schema.files)
        .where(and(eq(schema.files.id, entityId), isNotNull(schema.files.deletedAt)))
        .returning();
      deleted = fileResult.length > 0;
      break;
  }

  if (!deleted) {
    return c.json({ success: false, error: 'العنصر غير موجود' }, 404);
  }

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'permanent_delete',
    entityType,
    entityId,
  });

  logger.info(`Permanently deleted ${entityType}: ${entityId} by ${user.email}`);

  return c.json({ success: true, message: 'تم الحذف النهائي بنجاح' });
});

// ============================================
// DELETE /trash/empty - تفريغ المحذوفات
// ============================================
trash.delete('/empty', requirePermission('empty_trash'), async (c) => {
  const user = c.get('user');
  const entityType = c.req.query('entityType');

  let deletedCount = 0;

  if (!entityType || entityType === 'users') {
    const result = await db.delete(schema.users).where(isNotNull(schema.users.deletedAt)).returning();
    deletedCount += result.length;
  }

  if (!entityType || entityType === 'roles') {
    const result = await db.delete(schema.roles).where(isNotNull(schema.roles.deletedAt)).returning();
    deletedCount += result.length;
  }

  if (!entityType || entityType === 'courses') {
    const result = await db.delete(schema.courses).where(isNotNull(schema.courses.deletedAt)).returning();
    deletedCount += result.length;
  }

  if (!entityType || entityType === 'files') {
    const result = await db.delete(schema.files).where(isNotNull(schema.files.deletedAt)).returning();
    deletedCount += result.length;
  }

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'empty_trash',
    entityType: entityType || 'all',
    newValue: { deletedCount },
  });

  logger.info(`Trash emptied by ${user.email}, deleted ${deletedCount} items`);

  return c.json({ success: true, message: `تم حذف ${deletedCount} عنصر نهائياً` });
});

export default trash;
