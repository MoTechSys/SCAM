// ===== مسارات API =====
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  ROLES: {
    BASE: '/roles',
    BY_ID: (id: string) => `/roles/${id}`,
  },
  COURSES: {
    BASE: '/courses',
    BY_ID: (id: string) => `/courses/${id}`,
  },
  FILES: {
    BASE: '/files',
    BY_ID: (id: string) => `/files/${id}`,
    UPLOAD: '/files/upload',
    DOWNLOAD: (id: string) => `/files/${id}/download`,
  },
  AI: {
    CHAT: '/ai/chat',
    CONVERSATIONS: '/ai/conversations',
  },
  SETTINGS: {
    BASE: '/settings',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
  },
} as const;

// ===== مفاتيح التخزين المحلي =====
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'scam-access-token',
  REFRESH_TOKEN: 'scam-refresh-token',
  USER: 'scam-user',
  THEME: 'scam-theme',
  LANGUAGE: 'scam-language',
} as const;

// ===== الأدوار الافتراضية =====
export const DEFAULT_ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
} as const;

// ===== أنواع الملفات المسموحة =====
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  PRESENTATIONS: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
} as const;

// ===== حدود الملفات =====
export const FILE_LIMITS = {
  MAX_SIZE: 50 * 1024 * 1024, // 50 MB
  MAX_SIZE_IMAGE: 5 * 1024 * 1024, // 5 MB
  MAX_SIZE_VIDEO: 100 * 1024 * 1024, // 100 MB
} as const;

// ===== رسائل الخطأ =====
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'غير مصرح لك بالوصول',
  FORBIDDEN: 'ليس لديك صلاحية لهذا الإجراء',
  NOT_FOUND: 'العنصر غير موجود',
  INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  TOKEN_EXPIRED: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
  SERVER_ERROR: 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
} as const;
