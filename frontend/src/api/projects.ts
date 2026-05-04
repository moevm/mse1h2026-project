import type { Project } from '@/types';

import axiosInstance from './axios';

export const projectsApi = {
  getAll: () => axiosInstance.get<Project[]>('/projects').then((res) => res.data),

  getByCourseId: (courseId: string) => 
    axiosInstance.get<Project[]>(`/projects?courseId=${courseId}`).then((res) => res.data),

  getById: (id: string) => axiosInstance.get<Project>(`/projects/${id}`).then((res) => res.data),

  create: (data: Partial<Project>) =>
    axiosInstance.post<Project>('/projects', data).then((res) => res.data),

  update: (id: string, data: Partial<Project>) =>
    axiosInstance.put<Project>(`/projects/${id}`, data).then((res) => res.data),

  delete: (id: string) => axiosInstance.delete(`/projects/${id}`).then((res) => res.data),
};
