import type { Course } from '@/types';

import axiosInstance from './axios';

export const coursesApi = {
  getAll: () => axiosInstance.get<Course[]>('/courses').then((res) => res.data),

  getById: (id: string) => axiosInstance.get<Course>(`/courses/${id}`).then((res) => res.data),

  create: (data: Partial<Course>) =>
    axiosInstance.post<Course>('/courses', data).then((res) => res.data),

  update: (id: string, data: Course) =>
    axiosInstance.put<Course>(`/courses/${id}`, data).then((res) => res.data),

  delete: (id: string) => axiosInstance.delete(`/courses/${id}`).then((res) => res.data),
};
