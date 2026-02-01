import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import logger from '../lib/logger.js';

/**
 * Global Error Handler
 */
export const errorHandler = (err: Error, c: Context) => {
  // Log the error
  logger.error({
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(e.message);
    });

    return c.json(
      {
        success: false,
        error: 'خطأ في البيانات المدخلة',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
      400
    );
  }

  // Handle HTTP exceptions
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
        code: `HTTP_${err.status}`,
      },
      err.status
    );
  }

  // Handle unknown errors
  const isDev = process.env.NODE_ENV !== 'production';
  return c.json(
    {
      success: false,
      error: isDev ? err.message : 'حدث خطأ في الخادم',
      code: 'INTERNAL_ERROR',
      ...(isDev && { stack: err.stack }),
    },
    500
  );
};

/**
 * Not Found Handler
 */
export const notFoundHandler = (c: Context) => {
  return c.json(
    {
      success: false,
      error: 'المسار غير موجود',
      code: 'NOT_FOUND',
      path: c.req.path,
    },
    404
  );
};
