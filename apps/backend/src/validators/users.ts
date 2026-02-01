import { z } from 'zod';

/**
 * Create User Schema
 */
export const createUserSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم'),
  fullName: z.string().min(2, 'الاسم الكامل مطلوب').max(255),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'الدور مطلوب'),
  majorId: z.string().optional(),
  levelId: z.string().optional(),
  studentId: z.string().optional(),
  isActive: z.boolean().default(true),
});

/**
 * Update User Schema
 */
export const updateUserSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح').optional(),
  fullName: z.string().min(2).max(255).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  roleId: z.string().optional(),
  majorId: z.string().nullable().optional(),
  levelId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Query Users Schema
 */
export const queryUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  roleId: z.string().optional(),
  majorId: z.string().optional(),
  levelId: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  sortBy: z.enum(['fullName', 'email', 'createdAt', 'lastLogin']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type QueryUsersInput = z.infer<typeof queryUsersSchema>;
