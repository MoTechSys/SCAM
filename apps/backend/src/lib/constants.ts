/**
 * S-ACM Backend Constants
 * الثوابت المستخدمة في النظام
 */

// ============================================
// 🔐 Auth Constants
// ============================================

export const AUTH = {
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  SALT_ROUNDS: 12,
  MIN_PASSWORD_LENGTH: 8,
} as const;

// ============================================
// 📄 Pagination Constants
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ============================================
// 🗑️ Trash Constants
// ============================================

export const TRASH = {
  RETENTION_DAYS: 30, // أيام الاحتفاظ قبل الحذف النهائي
} as const;

// ============================================
// 📁 File Constants
// ============================================

export const FILE = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
  ],
  CATEGORIES: ['lecture', 'assignment', 'exam', 'resource', 'other'] as const,
} as const;

// ============================================
// 🔔 Notification Constants
// ============================================

export const NOTIFICATION = {
  TYPES: ['info', 'warning', 'success', 'error'] as const,
  RECIPIENT_TYPES: ['all', 'role', 'major', 'level', 'user'] as const,
} as const;

// ============================================
// 👤 User Constants
// ============================================

export const USER = {
  STATUSES: ['active', 'inactive', 'pending'] as const,
} as const;

// ============================================
// 📚 Course Constants
// ============================================

export const COURSE = {
  STATUSES: ['active', 'inactive', 'archived'] as const,
  SEMESTERS: ['first', 'second', 'summer'] as const,
} as const;

// ============================================
// 🤖 AI Constants
// ============================================

export const AI = {
  MAX_TEXT_LENGTH: 50000, // الحد الأقصى للنص
  DEFAULT_SUMMARY_LENGTH: 500,
  DEFAULT_QUESTIONS_COUNT: 5,
  QUESTION_TYPES: ['mcq', 'true_false', 'short_answer'] as const,
} as const;

// ============================================
// 📝 Audit Constants
// ============================================

export const AUDIT = {
  ACTIONS: [
    'create',
    'update',
    'delete',
    'restore',
    'login',
    'logout',
    'download',
    'upload',
    'view',
  ] as const,
  ENTITY_TYPES: [
    'user',
    'role',
    'course',
    'file',
    'notification',
    'major',
    'level',
    'department',
    'settings',
  ] as const,
} as const;


// ============================================
// 🔐 Permissions Constants
// ============================================

export const ALL_PERMISSIONS = {
  dashboard: {
    name: 'لوحة التحكم',
    permissions: [
      { key: 'view_dashboard', name: 'عرض لوحة التحكم', description: 'الوصول إلى لوحة التحكم الرئيسية' },
      { key: 'view_stats', name: 'عرض الإحصائيات', description: 'عرض إحصائيات النظام' },
      { key: 'view_charts', name: 'عرض الرسوم البيانية', description: 'عرض الرسوم البيانية' },
    ],
  },
  users: {
    name: 'إدارة المستخدمين',
    permissions: [
      { key: 'view_users', name: 'عرض المستخدمين', description: 'عرض قائمة المستخدمين' },
      { key: 'add_user', name: 'إضافة مستخدم', description: 'إضافة مستخدم جديد' },
      { key: 'edit_user', name: 'تعديل مستخدم', description: 'تعديل بيانات مستخدم' },
      { key: 'delete_user', name: 'حذف مستخدم', description: 'حذف مستخدم' },
      { key: 'reset_user_password', name: 'إعادة تعيين كلمة المرور', description: 'إعادة تعيين كلمة مرور مستخدم' },
    ],
  },
  roles: {
    name: 'إدارة الأدوار',
    permissions: [
      { key: 'view_roles', name: 'عرض الأدوار', description: 'عرض قائمة الأدوار' },
      { key: 'add_role', name: 'إضافة دور', description: 'إضافة دور جديد' },
      { key: 'edit_role', name: 'تعديل دور', description: 'تعديل صلاحيات دور' },
      { key: 'delete_role', name: 'حذف دور', description: 'حذف دور' },
    ],
  },
  courses: {
    name: 'إدارة المقررات',
    permissions: [
      { key: 'view_courses', name: 'عرض المقررات', description: 'عرض قائمة المقررات' },
      { key: 'add_course', name: 'إضافة مقرر', description: 'إضافة مقرر جديد' },
      { key: 'edit_course', name: 'تعديل مقرر', description: 'تعديل بيانات مقرر' },
      { key: 'delete_course', name: 'حذف مقرر', description: 'حذف مقرر' },
    ],
  },
  files: {
    name: 'إدارة الملفات',
    permissions: [
      { key: 'view_files', name: 'عرض الملفات', description: 'عرض قائمة الملفات' },
      { key: 'upload_file', name: 'رفع ملف', description: 'رفع ملف جديد' },
      { key: 'download_file', name: 'تحميل ملف', description: 'تحميل ملف' },
      { key: 'delete_file', name: 'حذف ملف', description: 'حذف ملف' },
    ],
  },
  academic: {
    name: 'البيانات الأكاديمية',
    permissions: [
      { key: 'view_academic', name: 'عرض البيانات الأكاديمية', description: 'عرض الأقسام والتخصصات والمستويات' },
      { key: 'manage_departments', name: 'إدارة الأقسام', description: 'إضافة وتعديل وحذف الأقسام' },
      { key: 'manage_majors', name: 'إدارة التخصصات', description: 'إضافة وتعديل وحذف التخصصات' },
      { key: 'manage_levels', name: 'إدارة المستويات', description: 'إضافة وتعديل وحذف المستويات' },
    ],
  },
  notifications: {
    name: 'الإشعارات',
    permissions: [
      { key: 'view_notifications', name: 'عرض الإشعارات', description: 'عرض الإشعارات' },
      { key: 'send_notification', name: 'إرسال إشعار', description: 'إرسال إشعار جديد' },
      { key: 'delete_notification', name: 'حذف إشعار', description: 'حذف إشعار' },
    ],
  },
  ai: {
    name: 'الذكاء الاصطناعي',
    permissions: [
      { key: 'use_ai', name: 'استخدام الذكاء الاصطناعي', description: 'الوصول إلى أدوات الذكاء الاصطناعي' },
      { key: 'ai_chat', name: 'المحادثة الذكية', description: 'استخدام المحادثة الذكية' },
      { key: 'ai_summarize', name: 'تلخيص النصوص', description: 'تلخيص النصوص' },
      { key: 'ai_generate', name: 'توليد المحتوى', description: 'توليد محتوى جديد' },
    ],
  },
  reports: {
    name: 'التقارير',
    permissions: [
      { key: 'view_reports', name: 'عرض التقارير', description: 'عرض التقارير' },
      { key: 'export_reports', name: 'تصدير التقارير', description: 'تصدير التقارير' },
    ],
  },
  settings: {
    name: 'الإعدادات',
    permissions: [
      { key: 'view_settings', name: 'عرض الإعدادات', description: 'عرض إعدادات النظام' },
      { key: 'edit_settings', name: 'تعديل الإعدادات', description: 'تعديل إعدادات النظام' },
    ],
  },
  audit: {
    name: 'سجلات التدقيق',
    permissions: [
      { key: 'view_audit_logs', name: 'عرض سجلات التدقيق', description: 'عرض سجلات التدقيق' },
      { key: 'export_audit_logs', name: 'تصدير سجلات التدقيق', description: 'تصدير سجلات التدقيق' },
    ],
  },
  trash: {
    name: 'سلة المحذوفات',
    permissions: [
      { key: 'view_trash', name: 'عرض سلة المحذوفات', description: 'عرض العناصر المحذوفة' },
      { key: 'restore_item', name: 'استعادة عنصر', description: 'استعادة عنصر محذوف' },
      { key: 'permanent_delete', name: 'حذف نهائي', description: 'حذف عنصر نهائياً' },
    ],
  },
} as const;

// قائمة مسطحة بجميع مفاتيح الصلاحيات
export const PERMISSION_KEYS = Object.values(ALL_PERMISSIONS)
  .flatMap((category) => category.permissions.map((p) => p.key));
