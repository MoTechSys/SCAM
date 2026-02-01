/**
 * Custom hooks for API calls
 * S-ACM Frontend
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  usersApi, 
  rolesApi, 
  coursesApi, 
  filesApi, 
  academicApi,
  notificationsApi,
  ApiResponse 
} from '@/lib/api';

// Generic hook for fetching data
export function useFetch<T>(
  fetchFn: () => Promise<ApiResponse<T>>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'حدث خطأ');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Users hooks
export function useUsers() {
  return useFetch(() => usersApi.getAll(), []);
}

export function useUser(id: string) {
  return useFetch(() => usersApi.getById(id), [id]);
}

// Roles hooks
export function useRoles() {
  return useFetch(() => rolesApi.getAll(), []);
}

export function useRole(id: string) {
  return useFetch(() => rolesApi.getById(id), [id]);
}

// Courses hooks
export function useCourses() {
  return useFetch(() => coursesApi.getAll(), []);
}

export function useCourse(id: string) {
  return useFetch(() => coursesApi.getById(id), [id]);
}

// Files hooks
export function useFiles() {
  return useFetch(() => filesApi.getAll(), []);
}

export function useCourseFiles(courseId: string) {
  return useFetch(() => filesApi.getByCourse(courseId), [courseId]);
}

// Academic hooks
export function useDepartments() {
  return useFetch(() => academicApi.getDepartments(), []);
}

export function useMajors() {
  return useFetch(() => academicApi.getMajors(), []);
}

export function useLevels() {
  return useFetch(() => academicApi.getLevels(), []);
}

// Notifications hooks
export function useNotifications() {
  return useFetch(() => notificationsApi.getAll(), []);
}

// Mutation hook for create/update/delete operations
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mutationFn(variables);
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'حدث خطأ');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = 'فشل الاتصال بالخادم';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { mutate, loading, error };
}

export default {
  useFetch,
  useUsers,
  useUser,
  useRoles,
  useRole,
  useCourses,
  useCourse,
  useFiles,
  useCourseFiles,
  useDepartments,
  useMajors,
  useLevels,
  useNotifications,
  useMutation,
};
