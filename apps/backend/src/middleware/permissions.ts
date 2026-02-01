import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * التحقق من وجود صلاحية 'all' (المدير الأعلى)
 */
const hasSuperAdminPermission = (permissions: string[] | undefined): boolean => {
  return permissions?.includes('all') ?? false;
};

/**
 * Middleware للتحقق من صلاحية واحدة
 */
export const requirePermission = (permission: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, { message: 'غير مصرح - يرجى تسجيل الدخول' });
    }

    // المدير الأعلى لديه جميع الصلاحيات
    if (hasSuperAdminPermission(user.permissions)) {
      await next();
      return;
    }

    if (!user.permissions || !user.permissions.includes(permission)) {
      throw new HTTPException(403, {
        message: `ليس لديك صلاحية: ${permission}`,
      });
    }

    await next();
  };
};

/**
 * Middleware للتحقق من أي صلاحية من قائمة (OR)
 */
export const requireAnyPermission = (permissions: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, { message: 'غير مصرح - يرجى تسجيل الدخول' });
    }

    // المدير الأعلى لديه جميع الصلاحيات
    if (hasSuperAdminPermission(user.permissions)) {
      await next();
      return;
    }

    const hasAnyPermission = permissions.some((p) => user.permissions?.includes(p));

    if (!hasAnyPermission) {
      throw new HTTPException(403, {
        message: `ليس لديك أي من الصلاحيات المطلوبة`,
      });
    }

    await next();
  };
};

/**
 * Middleware للتحقق من جميع الصلاحيات (AND)
 */
export const requireAllPermissions = (permissions: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, { message: 'غير مصرح - يرجى تسجيل الدخول' });
    }

    // المدير الأعلى لديه جميع الصلاحيات
    if (hasSuperAdminPermission(user.permissions)) {
      await next();
      return;
    }

    const hasAllPermissions = permissions.every((p) => user.permissions?.includes(p));

    if (!hasAllPermissions) {
      const missing = permissions.filter((p) => !user.permissions?.includes(p));
      throw new HTTPException(403, {
        message: `ينقصك الصلاحيات التالية: ${missing.join(', ')}`,
      });
    }

    await next();
  };
};

/**
 * التحقق من الصلاحية برمجياً (بدون middleware)
 */
export const hasPermission = (userPermissions: string[] | undefined, permission: string): boolean => {
  // المدير الأعلى لديه جميع الصلاحيات
  if (hasSuperAdminPermission(userPermissions)) {
    return true;
  }
  return userPermissions?.includes(permission) ?? false;
};

/**
 * التحقق من أي صلاحية برمجياً
 */
export const hasAnyPermission = (
  userPermissions: string[] | undefined,
  permissions: string[]
): boolean => {
  // المدير الأعلى لديه جميع الصلاحيات
  if (hasSuperAdminPermission(userPermissions)) {
    return true;
  }
  return permissions.some((p) => userPermissions?.includes(p));
};

// ============================================
// 🔐 Permission Keys
// ============================================

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD: {
    VIEW: 'view_dashboard',
    VIEW_STATS: 'view_dashboard_stats',
    VIEW_CHARTS: 'view_dashboard_charts',
    VIEW_RECENT_ACTIVITY: 'view_recent_activity',
  },

  // Users
  USERS: {
    VIEW: 'view_users',
    ADD: 'add_user',
    EDIT: 'edit_user',
    DELETE: 'delete_user',
    CHANGE_ROLE: 'change_user_role',
    CHANGE_STATUS: 'change_user_status',
    RESET_PASSWORD: 'reset_user_password',
    EXPORT: 'export_users',
  },

  // Roles
  ROLES: {
    VIEW: 'view_roles',
    ADD: 'add_role',
    EDIT: 'edit_role',
    DELETE: 'delete_role',
    MANAGE_PERMISSIONS: 'manage_role_permissions',
  },

  // Courses
  COURSES: {
    VIEW: 'view_courses',
    VIEW_ALL: 'view_all_courses',
    ADD: 'add_course',
    EDIT: 'edit_course',
    DELETE: 'delete_course',
    MANAGE_FILES: 'manage_course_files',
    EXPORT: 'export_courses',
  },

  // Files
  FILES: {
    VIEW: 'view_files',
    VIEW_ALL: 'view_all_files',
    UPLOAD: 'upload_file',
    DOWNLOAD: 'download_file',
    DELETE: 'delete_file',
    MANAGE_CATEGORIES: 'manage_file_categories',
  },

  // Academic
  ACADEMIC: {
    VIEW: 'view_academic',
    MANAGE_MAJORS: 'manage_majors',
    MANAGE_LEVELS: 'manage_levels',
    MANAGE_DEPARTMENTS: 'manage_departments',
  },

  // Notifications
  NOTIFICATIONS: {
    VIEW: 'view_notifications',
    SEND: 'send_notification',
    SEND_ALL: 'send_notification_all',
    DELETE: 'delete_notification',
  },

  // AI
  AI: {
    USE: 'use_ai',
    SUMMARIZE: 'ai_summarize',
    GENERATE_QUESTIONS: 'ai_generate_questions',
    CHAT: 'ai_chat',
  },

  // Reports
  REPORTS: {
    VIEW: 'view_reports',
    EXPORT: 'export_reports',
    VIEW_USER_REPORTS: 'view_user_reports',
    VIEW_COURSE_REPORTS: 'view_course_reports',
    VIEW_FILE_REPORTS: 'view_file_reports',
  },

  // Settings
  SETTINGS: {
    VIEW: 'view_settings',
    EDIT: 'edit_settings',
    MANAGE_SYSTEM: 'manage_system_settings',
  },

  // Audit Logs
  AUDIT: {
    VIEW: 'view_audit_logs',
    EXPORT: 'export_audit_logs',
  },

  // Trash
  TRASH: {
    VIEW: 'view_trash',
    RESTORE: 'restore_from_trash',
    PERMANENT_DELETE: 'permanent_delete',
  },
} as const;

// قائمة كل الصلاحيات
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap((category) =>
  Object.values(category)
);
