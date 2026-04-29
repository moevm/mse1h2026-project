import type { Project } from '@/types';

import axiosInstance from './axios';

export const projectsApi = {
  getAll: () => axiosInstance.get<Project[]>('/projects').then((res) => res.data),

  getById: (id: number) => axiosInstance.get<Project>(`/projects/${id}`).then((res) => res.data),

  create: (data: Partial<Project>) =>
    axiosInstance.post<Project>('/projects', data).then((res) => res.data),

  update: (id: number, data: Partial<Project>) =>
    axiosInstance.put<Project>(`/projects/${id}`, data).then((res) => res.data),

  delete: (id: number) => axiosInstance.delete(`/projects/${id}`).then((res) => res.data),
};
