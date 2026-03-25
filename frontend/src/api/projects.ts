import type { Project } from '@/types';

import { apiClient } from './client';

export const projectsApi = {
  getAll: () => apiClient.get<Project[]>('/projects'),

  getById: (id: string) => apiClient.get<Project>(`/projects/${id}`),

  create: (data: Partial<Project>) => apiClient.post<Project>('/projects', data),

  update: (id: string, data: Project) => apiClient.put<Project>(`/projects/${id}`, data),

  delete: (id: string) => apiClient.delete<Project>(`/projects/${id}`),
};
