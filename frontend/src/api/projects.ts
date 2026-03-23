import type { Project } from '@/types';

import { apiClient } from './client';

export const projectsApi = {
  getAll: () => apiClient.get<Project[]>('/projects'),

  getById: (id: number) => apiClient.get<Project>(`/projects/${id}`),

  create: (data: Partial<Project>) => apiClient.post<Project>('/projects', data),

  update: (id: number, data: Project) => apiClient.put<Project>(`/projects/${id}`, data),

  delete: (id: number) => apiClient.delete<Project>(`/projects/${id}`),
};
