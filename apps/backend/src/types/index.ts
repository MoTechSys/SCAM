/**
 * S-ACM Backend Types
 * الأنواع المشتركة للنظام
 */

// ============================================
// 🔐 Auth Types
// ============================================

export interface JWTPayload {
  userId: string;
  email: string;
  roleId: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ============================================
// 👤 User Types
// ============================================

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  roleId: string;
  majorId?: string;
  levelId?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  roleId: string;
  roleName?: string;
  majorId?: string;
  majorName?: string;
  levelId?: string;
  levelName?: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  createdAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roleId: string;
  majorId?: string;
  levelId?: string;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  roleId?: string;
  majorId?: string;
  levelId?: string;
  status?: 'active' | 'inactive' | 'pending';
}

// ============================================
// 🎭 Role & Permission Types
// ============================================

export interface Role {
  id: string;
  name: string;
  description?: string;
  color: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  description?: string;
  category: string;
  parentKey?: string;
}

export interface RolePermission {
  roleId: string;
  permissionKey: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  color: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  color?: string;
  permissions?: string[];
}

// ============================================
// 📚 Course Types
// ============================================

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  creditHours: number;
  majorId: string;
  levelId: string;
  instructorId?: string;
  semester: string;
  year: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateCourseRequest {
  code: string;
  name: string;
  description?: string;
  creditHours: number;
  majorId: string;
  levelId: string;
  instructorId?: string;
  semester: string;
  year: string;
}

export interface UpdateCourseRequest {
  code?: string;
  name?: string;
  description?: string;
  creditHours?: number;
  majorId?: string;
  levelId?: string;
  instructorId?: string;
  semester?: string;
  year?: string;
  status?: 'active' | 'inactive' | 'archived';
}

// ============================================
// 📁 File Types
// ============================================

export interface File {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  courseId?: string;
  uploaderId: string;
  category: 'lecture' | 'assignment' | 'exam' | 'resource' | 'other';
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface UploadFileRequest {
  courseId?: string;
  category: 'lecture' | 'assignment' | 'exam' | 'resource' | 'other';
}

// ============================================
// 🎓 Academic Types
// ============================================

export interface Major {
  id: string;
  name: string;
  code: string;
  departmentId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Level {
  id: string;
  name: string;
  number: number;
  majorId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// ============================================
// 🔔 Notification Types
// ============================================

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  senderId: string;
  recipientId?: string;
  recipientType: 'all' | 'role' | 'major' | 'level' | 'user';
  recipientFilter?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface CreateNotificationRequest {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipientType: 'all' | 'role' | 'major' | 'level' | 'user';
  recipientFilter?: string;
}

// ============================================
// 📊 Report Types
// ============================================

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalFiles: number;
  totalDownloads: number;
  activeUsers: number;
  newUsersThisMonth: number;
  storageUsed: number;
}

export interface UserActivity {
  date: string;
  logins: number;
  downloads: number;
  uploads: number;
}

// ============================================
// 🤖 AI Types
// ============================================

export interface AISummarizeRequest {
  text: string;
  maxLength?: number;
}

export interface AISummarizeResponse {
  summary: string;
  keyPoints: string[];
}

export interface AIGenerateQuestionsRequest {
  text: string;
  count?: number;
  type?: 'mcq' | 'true_false' | 'short_answer';
}

export interface AIGenerateQuestionsResponse {
  questions: AIQuestion[];
}

export interface AIQuestion {
  question: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

// ============================================
// 📝 Audit Log Types
// ============================================

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ============================================
// 🗑️ Trash Types
// ============================================

export interface TrashItem {
  id: string;
  entityType: 'user' | 'role' | 'course' | 'file' | 'notification';
  entityId: string;
  entityName: string;
  deletedBy: string;
  deletedAt: Date;
  expiresAt: Date;
}

// ============================================
// 📄 Pagination Types
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================
// 🌐 API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}
