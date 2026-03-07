import { apiClient } from './client';
import type { Course } from '../types';

export const coursesApi = {
  getAll: () => apiClient.get<Course[]>('/courses'),

  getById: (uid: number) => apiClient.get<Course>(`/courses/${uid}`),

  create: (data: Partial<Course>) => apiClient.post<Course>('/courses', data),

  update: (uid: number, data: Partial<Course>) => apiClient.put<Course>(`/courses/${uid}`, data),

  delete: (uid: number) => apiClient.delete<Course>(`/courses/${uid}`),
};
