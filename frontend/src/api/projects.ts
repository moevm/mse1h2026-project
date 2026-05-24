import type { Project } from '@/types';

import axiosInstance from './axios';

const baseEndpoint = '/projects';

export const projectsApi = {
  getAll: () => axiosInstance.get<Project[]>(baseEndpoint).then((res) => res.data),

  getByCourseId: (courseId: string) =>
    axiosInstance.get<Project[]>(`${baseEndpoint}?courseId=${courseId}`).then((res) => res.data),

  getFreeByCourseId: (courseId: string) =>
    axiosInstance
      .get<Project[]>(`${baseEndpoint}?courseId=${courseId}&onlyFree=true`)
      .then((res) => res.data),

  getById: (id: string) =>
    axiosInstance.get<Project>(`${baseEndpoint}/${id}`).then((res) => res.data),

  create: (data: Partial<Project>) =>
    axiosInstance.post<Project>(baseEndpoint, data).then((res) => res.data),

  update: (id: string, data: Partial<Project>) =>
    axiosInstance.put<Project>(`${baseEndpoint}/${id}`, data).then((res) => res.data),

  delete: (id: string) => axiosInstance.delete(`${baseEndpoint}/${id}`).then((res) => res.data),
};
