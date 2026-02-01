/**
 * API Client for S-ACM Backend
 * يتصل بـ Railway Backend API
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://web-production-47834.up.railway.app') + '/api';

// Types
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Token management
const TOKEN_KEY = 's-acm-access-token';
const REFRESH_TOKEN_KEY = 's-acm-refresh-token';
const USER_KEY = 's-acm-user';

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const getStoredUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAccessToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: 'فشل الاتصال بالخادم',
      code: 'NETWORK_ERROR',
    };
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse['data']>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      setAccessToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);
      setStoredUser(response.data.user);
    }

    return response as LoginResponse;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiRequest<void>('/auth/logout', {
      method: 'POST',
    });
    clearAuth();
    return response;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/auth/me');
  },

  refreshToken: async (): Promise<ApiResponse<{ accessToken: string }>> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return { success: false, error: 'لا يوجد رمز تجديد' };
    }

    const response = await apiRequest<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.success && response.data) {
      setAccessToken(response.data.accessToken);
    }

    return response;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Users API
// Backend returns: { success: true, data: User[], pagination: {...} }
export interface UsersListResponse {
  data?: User[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const usersApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: string;
    status?: string;
  }): Promise<{ success: boolean; data?: User[]; pagination?: UsersListResponse['pagination']; error?: string }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.roleId) searchParams.set('roleId', params.roleId);
    if (params?.status) searchParams.set('status', params.status);
    const query = searchParams.toString();
    // Backend returns { success, data: User[], pagination }
    const response = await apiRequest<any>(`/users${query ? `?${query}` : ''}`);
    return {
      success: response.success,
      data: response.data,
      pagination: response.pagination,
      error: response.error
    };
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/${id}`);
  },

  create: async (userData: Partial<User> & { password: string }): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  resetPassword: async (id: string): Promise<ApiResponse<{ temporaryPassword: string }>> => {
    return apiRequest<{ temporaryPassword: string }>(`/users/${id}/reset-password`, {
      method: 'POST',
    });
  },
};

// Roles API
export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  usersCount: number;
  permissionsCount: number;
  permissions: string[];
  createdAt: string;
}

export const rolesApi = {
  getAll: async (): Promise<ApiResponse<Role[]>> => {
    return apiRequest<Role[]>('/roles');
  },

  getPermissions: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/roles/permissions');
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/roles/${id}`);
  },

  create: async (roleData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  },

  update: async (id: string, roleData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/roles/${id}`, {
      method: 'DELETE',
    });
  },
};

// Courses API
export const coursesApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/courses');
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/courses/${id}`);
  },

  create: async (courseData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  update: async (id: string, courseData: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/courses/${id}`, {
      method: 'DELETE',
    });
  },
};

// Files API
export const filesApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/files');
  },

  getByCourse: async (courseId: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/files?courseId=${courseId}`);
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/files/${id}`);
  },

  upload: async (file: File, data: { name?: string; courseId?: string; category?: string; description?: string }): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (data.name) formData.append('name', data.name);
    if (data.courseId) formData.append('courseId', data.courseId);
    if (data.category) formData.append('category', data.category);
    if (data.description) formData.append('description', data.description);

    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    });

    return response.json();
  },

  download: async (id: string): Promise<ApiResponse<{ url: string }>> => {
    return apiRequest<{ url: string }>(`/files/${id}/download`, {
      method: 'POST',
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/files/${id}`, {
      method: 'DELETE',
    });
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/notifications');
  },

  markAsRead: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    return apiRequest<void>('/notifications/read-all', {
      method: 'PUT',
    });
  },

  send: async (data: { title: string; message: string; type?: string; targetUsers?: string[] }): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};

// Trash API
export const trashApi = {
  getAll: async (entityType?: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/trash${entityType ? `?entityType=${entityType}` : ''}`);
  },

  restore: async (entityType: string, entityId: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>('/trash/restore', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId }),
    });
  },

  permanentDelete: async (entityType: string, entityId: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>('/trash/permanent', {
      method: 'DELETE',
      body: JSON.stringify({ entityType, entityId }),
    });
  },

  empty: async (entityType?: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/trash/empty${entityType ? `?entityType=${entityType}` : ''}`, {
      method: 'DELETE',
    });
  },
};

// Settings API
export const settingsApi = {
  getAll: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/settings');
  },

  update: async (settings: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/reports/dashboard');
  },
};

// Reports API
export const reportsApi = {
  getDashboard: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/reports/dashboard');
  },
  getUsers: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/reports/users');
  },
  getCourses: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/reports/courses');
  },
  getFiles: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/reports/files');
  },
  getActivity: async (days?: number): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/reports/activity${days ? `?days=${days}` : ''}`);
  },
};

// Audit Logs API
export const auditLogsApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return apiRequest<any>(`/audit-logs${query ? `?${query}` : ''}`);
  },
};

// Academic API
export const academicApi = {
  // Departments
  getDepartments: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/academic/departments');
  },
  createDepartment: async (data: { name: string; description?: string }): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/academic/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateDepartment: async (id: string, data: { name?: string; description?: string }): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/academic/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteDepartment: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/academic/departments/${id}`, {
      method: 'DELETE',
    });
  },

  // Majors
  getMajors: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/academic/majors');
  },
  createMajor: async (data: { name: string; code: string; departmentId: string; description?: string }): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/academic/majors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateMajor: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/academic/majors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteMajor: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/academic/majors/${id}`, {
      method: 'DELETE',
    });
  },

  // Levels
  getLevels: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>('/academic/levels');
  },
  createLevel: async (data: { name: string; number: number; majorId: string }): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/academic/levels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateLevel: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/academic/levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteLevel: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/academic/levels/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authApi,
  users: usersApi,
  roles: rolesApi,
  courses: coursesApi,
  files: filesApi,
  notifications: notificationsApi,
  trash: trashApi,
  settings: settingsApi,
  academic: academicApi,
  dashboard: dashboardApi,
  reports: reportsApi,
  auditLogs: auditLogsApi,
};
