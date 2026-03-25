import type { Course } from '@/types';

import { apiClient } from './client';

export const coursesApi = {
  getAll: () => apiClient.get<Course[]>('/courses'),

  getById: (id: string) => apiClient.get<Course>(`/courses/${id}`),

  create: (data: Partial<Course>) => apiClient.post<Course>('/courses', data),

  update: (id: string, data: Course) => apiClient.put<Course>(`/courses/${id}`, data),

  delete: (id: string) => apiClient.delete<Course>(`/courses/${id}`),
};
