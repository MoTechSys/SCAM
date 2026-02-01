import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, or, like, isNull, desc, asc, count } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { createUserSchema, updateUserSchema, queryUsersSchema } from '../validators/users.js';
import logger from '../lib/logger.js';

const users = new Hono();

// Apply auth middleware to all routes
users.use('*', authMiddleware);

// ============================================
// GET /users - قائمة المستخدمين
// ============================================
users.get('/', requirePermission('view_users'), zValidator('query', queryUsersSchema), async (c) => {
  const query = c.req.valid('query');
  const { page, limit, search, roleId, majorId, levelId, status, sortBy, sortOrder } = query;

  // Build where conditions
  const conditions = [isNull(schema.users.deletedAt)];

  if (search) {
    conditions.push(
      or(
        like(schema.users.fullName, `%${search}%`),
        like(schema.users.email, `%${search}%`)
      )!
    );
  }
  if (roleId) conditions.push(eq(schema.users.roleId, roleId));
  if (majorId) conditions.push(eq(schema.users.majorId, majorId));
  if (levelId) conditions.push(eq(schema.users.levelId, levelId));
  if (status === 'active') conditions.push(eq(schema.users.isActive, true));
  if (status === 'inactive') conditions.push(eq(schema.users.isActive, false));

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(schema.users)
    .where(and(...conditions));

  // Get users with pagination
  const offset = (page - 1) * limit;
  const orderColumn = schema.users[sortBy as keyof typeof schema.users] || schema.users.createdAt;
  const orderFn = sortOrder === 'asc' ? asc : desc;

  const usersList = await db.query.users.findMany({
    where: and(...conditions),
    with: {
      role: true,
      major: true,
      level: true,
    },
    limit,
    offset,
    orderBy: [orderFn(orderColumn as any)],
  });

  // Map to public format
  const data = usersList.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    avatar: u.avatar,
    roleId: u.roleId,
    roleName: u.role?.name,
    majorId: u.majorId,
    majorName: u.major?.name,
    levelId: u.levelId,
    levelName: u.level?.name,
    status: u.isActive ? 'active' : 'inactive',
    isActive: u.isActive,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt,
  }));

  return c.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

// ============================================
// GET /users/:id - مستخدم محدد
// ============================================
users.get('/:id', requirePermission('view_users'), async (c) => {
  const id = c.req.param('id');

  const user = await db.query.users.findFirst({
    where: and(eq(schema.users.id, id), isNull(schema.users.deletedAt)),
    with: {
      role: true,
      major: true,
      level: true,
    },
  });

  if (!user) {
    return c.json({ success: false, error: 'المستخدم غير موجود' }, 404);
  }

  // Get permissions from role
  const permissions = (user.role?.permissions as string[]) || [];

  return c.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatar: user.avatar,
      roleId: user.roleId,
      roleName: user.role?.name,
      majorId: user.majorId,
      majorName: user.major?.name,
      levelId: user.levelId,
      levelName: user.level?.name,
      status: user.isActive ? 'active' : 'inactive',
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      permissions,
    },
  });
});

// ============================================
// POST /users - إضافة مستخدم
// ============================================
users.post('/', requirePermission('add_user'), zValidator('json', createUserSchema), async (c) => {
  const currentUser = c.get('user');
  const data = c.req.valid('json');

  // Check if email exists
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, data.email),
  });

  if (existing) {
    return c.json({ success: false, error: 'البريد الإلكتروني مستخدم بالفعل' }, 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // Create user
  const [newUser] = await db
    .insert(schema.users)
    .values({
      email: data.email,
      passwordHash: hashedPassword,
      fullName: data.fullName,
      phone: data.phone,
      roleId: data.roleId,
      majorId: data.majorId,
      levelId: data.levelId,
      studentId: data.studentId,
      isActive: true,
    })
    .returning();

  // Log audit
  await db.insert(schema.auditLogs).values({
    userId: currentUser.userId,
    action: 'create',
    entityType: 'user',
    entityId: newUser.id,
    newValue: { email: data.email, fullName: data.fullName, roleId: data.roleId },
  });

  logger.info(`User created: ${data.email} by ${currentUser.email}`);

  return c.json(
    {
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      },
      message: 'تم إضافة المستخدم بنجاح',
    },
    201
  );
});

// ============================================
// PUT /users/:id - تعديل مستخدم
// ============================================
users.put('/:id', requirePermission('edit_user'), zValidator('json', updateUserSchema), async (c) => {
  const currentUser = c.get('user');
  const id = c.req.param('id');
  const data = c.req.valid('json');

  // Get existing user
  const existing = await db.query.users.findFirst({
    where: and(eq(schema.users.id, id), isNull(schema.users.deletedAt)),
  });

  if (!existing) {
    return c.json({ success: false, error: 'المستخدم غير موجود' }, 404);
  }

  // Check email uniqueness if changed
  if (data.email && data.email !== existing.email) {
    const emailExists = await db.query.users.findFirst({
      where: eq(schema.users.email, data.email),
    });
    if (emailExists) {
      return c.json({ success: false, error: 'البريد الإلكتروني مستخدم بالفعل' }, 400);
    }
  }

  // Build update object
  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (data.email) updateData.email = data.email;
  if (data.fullName) updateData.fullName = data.fullName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.roleId !== undefined) updateData.roleId = data.roleId;
  if (data.majorId !== undefined) updateData.majorId = data.majorId;
  if (data.levelId !== undefined) updateData.levelId = data.levelId;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Update user
  const [updated] = await db
    .update(schema.users)
    .set(updateData)
    .where(eq(schema.users.id, id))
    .returning();

  // Log audit
  await db.insert(schema.auditLogs).values({
    userId: currentUser.userId,
    action: 'update',
    entityType: 'user',
    entityId: id,
    oldValue: { email: existing.email, fullName: existing.fullName, isActive: existing.isActive },
    newValue: data,
  });

  logger.info(`User updated: ${id} by ${currentUser.email}`);

  return c.json({
    success: true,
    data: {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      isActive: updated.isActive,
      updatedAt: updated.updatedAt,
    },
    message: 'تم تحديث المستخدم بنجاح',
  });
});

// ============================================
// DELETE /users/:id - حذف مستخدم (Soft Delete)
// ============================================
users.delete('/:id', requirePermission('delete_user'), async (c) => {
  const currentUser = c.get('user');
  const id = c.req.param('id');

  // Prevent self-deletion
  if (id === currentUser.userId) {
    return c.json({ success: false, error: 'لا يمكنك حذف حسابك' }, 400);
  }

  const existing = await db.query.users.findFirst({
    where: and(eq(schema.users.id, id), isNull(schema.users.deletedAt)),
  });

  if (!existing) {
    return c.json({ success: false, error: 'المستخدم غير موجود' }, 404);
  }

  // Soft delete
  await db
    .update(schema.users)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.users.id, id));

  // Log audit
  await db.insert(schema.auditLogs).values({
    userId: currentUser.userId,
    action: 'delete',
    entityType: 'user',
    entityId: id,
    oldValue: { email: existing.email, fullName: existing.fullName },
  });

  logger.info(`User deleted: ${id} by ${currentUser.email}`);

  return c.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
});

// ============================================
// POST /users/:id/reset-password - إعادة تعيين كلمة المرور
// ============================================
users.post('/:id/reset-password', requirePermission('reset_user_password'), async (c) => {
  const currentUser = c.get('user');
  const id = c.req.param('id');

  const existing = await db.query.users.findFirst({
    where: and(eq(schema.users.id, id), isNull(schema.users.deletedAt)),
  });

  if (!existing) {
    return c.json({ success: false, error: 'المستخدم غير موجود' }, 404);
  }

  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  await db
    .update(schema.users)
    .set({ passwordHash: hashedPassword, updatedAt: new Date() })
    .where(eq(schema.users.id, id));

  // Log audit
  await db.insert(schema.auditLogs).values({
    userId: currentUser.userId,
    action: 'update',
    entityType: 'user',
    entityId: id,
    newValue: { action: 'password_reset' },
  });

  logger.info(`Password reset for user: ${id} by ${currentUser.email}`);

  return c.json({
    success: true,
    data: { temporaryPassword: tempPassword },
    message: 'تم إعادة تعيين كلمة المرور',
  });
});

export default users;
