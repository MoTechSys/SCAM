// ===== المستخدم =====
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  roleId?: string;
  roleName?: string;
  majorId?: string;
  majorName?: string;
  levelId?: string;
  levelName?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

// ===== الدور =====
export interface Role {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

// ===== المقرر =====
export interface Course {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  description?: string;
  credits: number;
  majorId?: string;
  levelId?: string;
  isActive: boolean;
  createdAt: string;
}

// ===== الملف =====
export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
  uploadedBy: string;
  courseId?: string;
  isDeleted: boolean;
  createdAt: string;
}

// ===== الإشعار =====
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
  isRead: boolean;
  createdAt: string;
}

// ===== استجابة API =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

// ===== استجابة تسجيل الدخول =====
export interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
  code?: string;
}

// ===== الصلاحيات =====
export type Permission = 
  | 'users:read' | 'users:create' | 'users:update' | 'users:delete'
  | 'roles:read' | 'roles:create' | 'roles:update' | 'roles:delete'
  | 'courses:read' | 'courses:create' | 'courses:update' | 'courses:delete'
  | 'files:read' | 'files:create' | 'files:update' | 'files:delete'
  | 'settings:read' | 'settings:update'
  | 'reports:read' | 'reports:export'
  | 'ai:use';
