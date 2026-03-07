import { apiClient } from './client';
import type { Project } from '../types';

export const projectsApi = {
  getAll: () => apiClient.get<Project[]>('/projects'),
  
  getById: (id: number) => apiClient.get<Project>(`/projects/${id}`),
  
  create: (data: Partial<Project>) => apiClient.post<Project>('/projects', data),
  
  update: (id: number, data: Partial<Project>) => 
    apiClient.put<Project>(`/projects/${id}`, data),
  
  delete: (id: number) => apiClient.delete<Project>(`/projects/${id}`),
};