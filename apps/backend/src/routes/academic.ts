import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const academic = new Hono();

academic.use('*', authMiddleware);

// ============================================
// Departments
// ============================================

academic.get('/departments', requirePermission('view_academic'), async (c) => {
  const departments = await db.query.departments.findMany({
    where: isNull(schema.departments.deletedAt),
    with: { majors: { where: isNull(schema.majors.deletedAt) } },
    orderBy: (d, { asc }) => [asc(d.name)],
  });

  const data = departments.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    isActive: d.isActive,
    majorsCount: d.majors?.length || 0,
    createdAt: d.createdAt,
  }));

  return c.json({ success: true, data });
});

const createDepartmentSchema = z.object({
  name: z.string().min(2, 'اسم القسم مطلوب'),
  description: z.string().optional(),
});

academic.post('/departments', requirePermission('manage_departments'), zValidator('json', createDepartmentSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  const [newDept] = await db.insert(schema.departments).values(data).returning();

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'create',
    entityType: 'department',
    entityId: newDept.id,
    newValue: data,
  });

  return c.json({ success: true, data: newDept, message: 'تم إضافة القسم بنجاح' }, 201);
});

academic.put('/departments/:id', requirePermission('manage_departments'), zValidator('json', createDepartmentSchema.partial()), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const data = c.req.valid('json');

  const existing = await db.query.departments.findFirst({
    where: and(eq(schema.departments.id, id), isNull(schema.departments.deletedAt)),
  });
  if (!existing) return c.json({ success: false, error: 'القسم غير موجود' }, 404);

  await db.update(schema.departments).set({ ...data, updatedAt: new Date() }).where(eq(schema.departments.id, id));

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'update',
    entityType: 'department',
    entityId: id,
    oldValue: { name: existing.name },
    newValue: data,
  });

  return c.json({ success: true, message: 'تم تحديث القسم بنجاح' });
});

academic.delete('/departments/:id', requirePermission('manage_departments'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const existing = await db.query.departments.findFirst({
    where: and(eq(schema.departments.id, id), isNull(schema.departments.deletedAt)),
  });
  if (!existing) return c.json({ success: false, error: 'القسم غير موجود' }, 404);

  await db.update(schema.departments).set({ deletedAt: new Date() }).where(eq(schema.departments.id, id));

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'delete',
    entityType: 'department',
    entityId: id,
  });

  return c.json({ success: true, message: 'تم حذف القسم بنجاح' });
});

// ============================================
// Majors
// ============================================

academic.get('/majors', requirePermission('view_academic'), async (c) => {
  const majors = await db.query.majors.findMany({
    where: isNull(schema.majors.deletedAt),
    with: {
      department: { columns: { id: true, name: true } },
      levels: { where: isNull(schema.levels.deletedAt) },
    },
    orderBy: (m, { asc }) => [asc(m.name)],
  });

  const data = majors.map((m) => ({
    id: m.id,
    name: m.name,
    code: m.code,
    description: m.description,
    departmentId: m.departmentId,
    departmentName: m.department?.name,
    isActive: m.isActive,
    levelsCount: m.levels?.length || 0,
    createdAt: m.createdAt,
  }));

  return c.json({ success: true, data });
});

const createMajorSchema = z.object({
  name: z.string().min(2, 'اسم التخصص مطلوب'),
  code: z.string().min(2, 'رمز التخصص مطلوب').max(20),
  departmentId: z.string().uuid('معرف القسم غير صالح'),
  description: z.string().optional(),
});

academic.post('/majors', requirePermission('manage_majors'), zValidator('json', createMajorSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  const [newMajor] = await db.insert(schema.majors).values(data).returning();

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'create',
    entityType: 'major',
    entityId: newMajor.id,
    newValue: data,
  });

  return c.json({ success: true, data: newMajor, message: 'تم إضافة التخصص بنجاح' }, 201);
});

academic.put('/majors/:id', requirePermission('manage_majors'), zValidator('json', createMajorSchema.partial()), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const data = c.req.valid('json');

  const existing = await db.query.majors.findFirst({
    where: and(eq(schema.majors.id, id), isNull(schema.majors.deletedAt)),
  });
  if (!existing) return c.json({ success: false, error: 'التخصص غير موجود' }, 404);

  await db.update(schema.majors).set({ ...data, updatedAt: new Date() }).where(eq(schema.majors.id, id));

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'update',
    entityType: 'major',
    entityId: id,
    oldValue: { name: existing.name },
    newValue: data,
  });

  return c.json({ success: true, message: 'تم تحديث التخصص بنجاح' });
});

academic.delete('/majors/:id', requirePermission('manage_majors'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const existing = await db.query.majors.findFirst({
    where: and(eq(schema.majors.id, id), isNull(schema.majors.deletedAt)),
  });
  if (!existing) return c.json({ success: false, error: 'التخصص غير موجود' }, 404);

  await db.update(schema.majors).set({ deletedAt: new Date() }).where(eq(schema.majors.id, id));

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'delete',
    entityType: 'major',
    entityId: id,
  });

  return c.json({ success: true, message: 'تم حذف التخصص بنجاح' });
});

// ============================================
// Levels
// ============================================

academic.get('/levels', requirePermission('view_academic'), async (c) => {
  const levels = await db.query.levels.findMany({
    where: isNull(schema.levels.deletedAt),
    with: { major: { columns: { id: true, name: true } } },
    orderBy: (l, { asc }) => [asc(l.name)],
  });

  const data = levels.map((l) => ({
    id: l.id,
    name: l.name,
    number: l.number,
    majorId: l.majorId,
    majorName: l.major?.name,
    isActive: l.isActive,
    createdAt: l.createdAt,
  }));

  return c.json({ success: true, data });
});

const createLevelSchema = z.object({
  name: z.string().min(2, 'اسم المستوى مطلوب'),
  number: z.number().min(1).max(10),
  majorId: z.string().uuid('معرف التخصص غير صالح'),
});

academic.post('/levels', requirePermission('manage_levels'), zValidator('json', createLevelSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  const [newLevel] = await db.insert(schema.levels).values(data).returning();

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'create',
    entityType: 'level',
    entityId: newLevel.id,
    newValue: data,
  });

  return c.json({ success: true, data: newLevel, message: 'تم إضافة المستوى بنجاح' }, 201);
});

academic.put('/levels/:id', requirePermission('manage_levels'), zValidator('json', createLevelSchema.partial()), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const data = c.req.valid('json');

  const existing = await db.query.levels.findFirst({
    where: and(eq(schema.levels.id, id), isNull(schema.levels.deletedAt)),
  });
  if (!existing) return c.json({ success: false, error: 'المستوى غير موجود' }, 404);

  await db.update(schema.levels).set({ ...data, updatedAt: new Date() }).where(eq(schema.levels.id, id));

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'update',
    entityType: 'level',
    entityId: id,
    oldValue: { name: existing.name },
    newValue: data,
  });

  return c.json({ success: true, message: 'تم تحديث المستوى بنجاح' });
});

academic.delete('/levels/:id', requirePermission('manage_levels'), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const existing = await db.query.levels.findFirst({
    where: and(eq(schema.levels.id, id), isNull(schema.levels.deletedAt)),
  });
  if (!existing) return c.json({ success: false, error: 'المستوى غير موجود' }, 404);

  await db.update(schema.levels).set({ deletedAt: new Date() }).where(eq(schema.levels.id, id));

  await db.insert(schema.auditLogs).values({
    userId: user.userId,
    action: 'delete',
    entityType: 'level',
    entityId: id,
  });

  return c.json({ success: true, message: 'تم حذف المستوى بنجاح' });
});

export default academic;
