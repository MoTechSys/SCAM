import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, isNull, count } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { createRoleSchema, updateRoleSchema } from '../validators/roles.js';
import logger from '../lib/logger.js';
import { ALL_PERMISSIONS } from '../lib/constants.js';

const roles = new Hono();

roles.use('*', authMiddleware);

// ============================================
// GET /roles - قائمة الأدوار
// ============================================
roles.get('/', requirePermission('view_roles'), async (c) => {
  const rolesList = await db.query.roles.findMany({
    where: isNull(schema.roles.deletedAt),
    with: {
      users: {
        where: isNull(schema.users.deletedAt),
      },
    },
    orderBy: (roles, { asc }) => [asc(roles.name)],
  });

  const data = rolesList.map((role) => {
    const permissions = (role.permissions as string[]) || [];
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      usersCount: role.users?.length || 0,
      permissionsCount: permissions.length,
      permissions,
      createdAt: role.createdAt,
    };
  });

  return c.json({ success: true, data });
});

// ============================================
// GET /roles/permissions - قائمة الصلاحيات المتاحة
// ============================================
roles.get('/permissions', requirePermission('view_roles'), async (c) => {
  // Return all available permissions grouped by category
  return c.json({ success: true, data: ALL_PERMISSIONS });
});

// ============================================
// GET /roles/:id - دور محدد
// ============================================
roles.get('/:id', requirePermission('view_roles'), async (c) => {
  const id = c.req.param('id');

  const role = await db.query.roles.findFirst({
    where: and(eq(schema.roles.id, id), isNull(schema.roles.deletedAt)),
    with: {
      users: {
        where: isNull(schema.users.deletedAt),
        columns: { id: true, fullName: true, email: true },
      },
    },
  });

  if (!role) {
    return c.json({ success: false, error: 'الدور غير موجود' }, 404);
  }

  const permissions = (role.permissions as string[]) || [];

  return c.json({
    success: true,
    data: {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions,
      users: role.users,
      createdAt: role.createdAt,
    },
  });
});

// ============================================
// POST /roles - إضافة دور
// ============================================
roles.post('/', requirePermission('add_role'), zValidator('json', createRoleSchema), async (c) => {
  const currentUser = c.get('user');
  const data = c.req.valid('json');

  // Check if name exists
  const existing = await db.query.roles.findFirst({
    where: eq(schema.roles.name, data.name),
  });

  if (existing) {
    return c.json({ success: false, error: 'اسم الدور مستخدم بالفعل' }, 400);
  }

  // Create role with permissions as JSONB array
  const [newRole] = await db
    .insert(schema.roles)
    .values({
      name: data.name,
      description: data.description,
      permissions: data.permissions || [],
    })
    .returning();

  // Log audit
  await db.insert(schema.auditLogs).values({
    userId: currentUser.userId,
    action: 'create',
    entityType: 'role',
    entityId: newRole.id,
    newValue: { name: data.name, permissions: data.permissions },
  });

  logger.info(`Role created: ${data.name} by ${currentUser.email}`);

  return c.json(
    {
      success: true,
      data: { id: newRole.id, name: newRole.name },
      message: 'تم إضافة الدور بنجاح',
    },
    201
  );
});

// ============================================
// PUT /roles/:id - تعديل دور
// ============================================
roles.put('/:id', requirePermission('edit_role'), zValidator('json', updateRoleSchema), async (c) => {
  const currentUser = c.get('user');
  const id = c.req.param('id');
  const data = c.req.valid('json');

  const existing = await db.query.roles.findFirst({
    where: and(eq(schema.roles.id, id), isNull(schema.roles.deletedAt)),
  });

  if (!existing) {
    return c.json({ success: false, error: 'الدور غير موجود' }, 404);
  }

  if (existing.isSystem && data.name && data.name !== existing.name) {
    return c.json({ success: false, error: 'لا يمكن تغيير اسم دور النظام' }, 400);
  }

  // Check name uniqueness
  if (data.name && data.name !== existing.name) {
    const nameExists = await db.query.roles.findFirst({
      where: eq(schema.roles.name, data.name),
    });
    if (nameExists) {
      return c.json({ success: false, error: 'اسم الدور مستخدم بالفعل' }, 400);
    }
  }

  // Update role
  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (data.name) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.permissions !== undefined) updateData.permissions = data.permissions;

  await db.update(schema.roles).set(updateData).where(eq(schema.roles.id, id));

  const oldPermissions = (existing.permissions as string[]) || [];

  // Log audit
  await db.insert(schema.auditLogs).values({
    userId: currentUser.userId,
    action: 'update',
    entityType: 'role',
    entityId: id,
    oldValue: { name: existing.name, permissions: oldPermissions },
    newValue: data,
  });

  logger.info(`Role updated: ${id} by ${currentUser.email}`);

  return c.json({ success: true, message: 'تم تحديث الدور بنجاح' });
});

// ============================================
// DELETE /roles/:id - حذف دور
// ============================================
roles.delete('/:id', requirePermission('delete_role'), async (c) => {
  const currentUser = c.get('user');
  const id = c.req.param('id');

  const existing = await db.query.roles.findFirst({
    where: and(eq(schema.roles.id, id), isNull(schema.roles.deletedAt)),
  });

  if (!existing) {
    return c.json({ success: false, error: 'الدور غير موجود' }, 404);
  }

  if (existing.isSystem) {
    return c.json({ success: false, error: 'لا يمكن حذف دور النظام' }, 400);
  }

  // Check if role has users
  const [{ usersCount }] = await db
    .select({ usersCount: count() })
    .from(schema.users)
    .where(and(eq(schema.users.roleId, id), isNull(schema.users.deletedAt)));

  if (usersCount > 0) {
    return c.json({ success: false, error: 'لا يمكن حذف دور مرتبط بمستخدمين' }, 400);
  }

  // Soft delete
  await db
    .update(schema.roles)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.roles.id, id));

  // Log audit
  await db.insert(schema.auditLogs).values({
    userId: currentUser.userId,
    action: 'delete',
    entityType: 'role',
    entityId: id,
    oldValue: { name: existing.name },
  });

  logger.info(`Role deleted: ${id} by ${currentUser.email}`);

  return c.json({ success: true, message: 'تم حذف الدور بنجاح' });
});

export default roles;
