import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../types/index.js';

// Extend Hono's Context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware للتحقق من JWT Token
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'غير مصرح - يرجى تسجيل الدخول' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    c.set('user', decoded);
    await next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new HTTPException(401, { message: 'انتهت صلاحية الجلسة - يرجى تسجيل الدخول مجدداً' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HTTPException(401, { message: 'رمز غير صالح' });
    }
    throw new HTTPException(401, { message: 'فشل التحقق من الهوية' });
  }
};

/**
 * Middleware اختياري - يمرر المستخدم إذا وجد التوكن
 */
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      c.set('user', decoded);
    } catch {
      // تجاهل الخطأ - المستخدم غير مسجل
    }
  }

  await next();
};

/**
 * إنشاء Access Token
 */
export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

/**
 * إنشاء Refresh Token
 */
export const generateRefreshToken = (userId: string): string => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

/**
 * التحقق من Refresh Token
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return { userId: decoded.userId };
};
