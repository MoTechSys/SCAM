import { z } from 'zod';

/**
 * Login Request Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('البريد الإلكتروني غير صالح')
    .min(1, 'البريد الإلكتروني مطلوب'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة'),
});

/**
 * Register Request Schema
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email('البريد الإلكتروني غير صالح')
    .min(1, 'البريد الإلكتروني مطلوب'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم'
    ),
  fullName: z
    .string()
    .min(2, 'الاسم الكامل يجب أن يكون حرفين على الأقل')
    .max(255, 'الاسم الكامل طويل جداً'),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, 'رقم الهاتف غير صالح')
    .optional(),
});

/**
 * Refresh Token Schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'رمز التجديد مطلوب'),
});

/**
 * Change Password Schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z
    .string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم'
    ),
});

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('البريد الإلكتروني غير صالح')
    .min(1, 'البريد الإلكتروني مطلوب'),
});

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'رمز إعادة التعيين مطلوب'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم'
    ),
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
