import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { eq, and, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import {
  authMiddleware,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../middleware/auth.js';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../validators/auth.js';
import logger from '../lib/logger.js';
import type { JWTPayload } from '../types/index.js';

const auth = new Hono();

// ============================================
// POST /auth/login - تسجيل الدخول
// ============================================
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');

    // Find user by email
    const user = await db.query.users.findFirst({
      where: and(eq(schema.users.email, email), isNull(schema.users.deletedAt)),
      with: {
        role: true,
        major: true,
        level: true,
      },
    });

    if (!user) {
      return c.json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return c.json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, 401);
    }

    // Check user status
    if (!user.isActive) {
      return c.json({ success: false, error: 'الحساب غير مفعل' }, 403);
    }

    // Get user permissions from role (stored as JSONB array)
    const permissions = (user.role?.permissions as string[]) || [];

    // Generate tokens
    const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId || '',
      permissions,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    // Update last login
    await db
      .update(schema.users)
      .set({ lastLogin: new Date() })
      .where(eq(schema.users.id, user.id));

    // Log audit
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    });

    logger.info(`User logged in: ${user.email}`);

    return c.json(
      {
        success: true,
        data: {
          user: {
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
            isActive: user.isActive,
            lastLogin: new Date(),
            createdAt: user.createdAt,
            permissions,
          },
          accessToken,
          refreshToken,
        },
      },
      200
    );
  } catch (error) {
    logger.error({ err: error }, 'Login error');
    return c.json({ success: false, error: 'حدث خطأ في الخادم', code: 'INTERNAL_ERROR' }, 500);
  }
});

// ============================================
// POST /auth/logout - تسجيل الخروج
// ============================================
auth.post('/logout', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    // Delete all refresh tokens for this user
    await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.userId, user.userId));

    // Log audit
    await db.insert(schema.auditLogs).values({
      userId: user.userId,
      action: 'logout',
      entityType: 'user',
      entityId: user.userId,
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    });

    logger.info(`User logged out: ${user.email}`);

    return c.json({ success: true, message: 'تم تسجيل الخروج بنجاح' }, 200);
  } catch (error) {
    logger.error({ err: error }, 'Logout error');
    return c.json({ success: false, error: 'حدث خطأ في الخادم' }, 500);
  }
});

// ============================================
// POST /auth/refresh - تجديد التوكن
// ============================================
auth.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');

  try {
    // Verify refresh token
    const { userId } = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const storedToken = await db.query.refreshTokens.findFirst({
      where: and(
        eq(schema.refreshTokens.token, refreshToken),
        eq(schema.refreshTokens.userId, userId)
      ),
    });

    if (!storedToken) {
      return c.json({ success: false, error: 'رمز التجديد غير صالح' }, 401);
    }

    // Check if token expired
    if (new Date() > storedToken.expiresAt) {
      await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.id, storedToken.id));
      return c.json({ success: false, error: 'انتهت صلاحية رمز التجديد' }, 401);
    }

    // Get user with role
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: {
        role: true,
      },
    });

    if (!user || !user.isActive) {
      return c.json({ success: false, error: 'المستخدم غير موجود أو غير مفعل' }, 401);
    }

    // Get permissions from role
    const permissions = (user.role?.permissions as string[]) || [];

    // Generate new access token
    const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId || '',
      permissions,
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    return c.json(
      {
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      },
      200
    );
  } catch (error) {
    return c.json({ success: false, error: 'رمز التجديد غير صالح' }, 401);
  }
});

// ============================================
// GET /auth/me - بيانات المستخدم الحالي
// ============================================
auth.get('/me', authMiddleware, async (c) => {
  try {
    const tokenUser = c.get('user');

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, tokenUser.userId),
      with: {
        role: true,
        major: true,
        level: true,
      },
    });

    if (!user) {
      return c.json({ success: false, error: 'المستخدم غير موجود' }, 404);
    }

    const permissions = (user.role?.permissions as string[]) || [];

    return c.json(
      {
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
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          permissions,
        },
      },
      200
    );
  } catch (error) {
    logger.error({ err: error }, 'Get me error');
    return c.json({ success: false, error: 'حدث خطأ في الخادم' }, 500);
  }
});

// ============================================
// POST /auth/change-password - تغيير كلمة المرور
// ============================================
auth.post(
  '/change-password',
  authMiddleware,
  zValidator('json', changePasswordSchema),
  async (c) => {
    try {
      const tokenUser = c.get('user');
      const { currentPassword, newPassword } = c.req.valid('json');

      // Get user
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, tokenUser.userId),
      });

      if (!user) {
        return c.json({ success: false, error: 'المستخدم غير موجود' }, 404);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return c.json({ success: false, error: 'كلمة المرور الحالية غير صحيحة' }, 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await db
        .update(schema.users)
        .set({ passwordHash: hashedPassword, updatedAt: new Date() })
        .where(eq(schema.users.id, user.id));

      // Log audit
      await db.insert(schema.auditLogs).values({
        userId: user.id,
        action: 'update',
        entityType: 'user',
        entityId: user.id,
        newValue: { action: 'password_changed' },
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
      });

      logger.info(`Password changed for user: ${user.email}`);

      return c.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' }, 200);
    } catch (error) {
      logger.error({ err: error }, 'Change password error');
      return c.json({ success: false, error: 'حدث خطأ في الخادم' }, 500);
    }
  }
);

export default auth;
