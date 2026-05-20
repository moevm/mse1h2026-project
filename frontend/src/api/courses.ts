import type { Course, CreateCoursePayload, UpdateCoursePayload } from '@/types';

import axiosInstance from './axios';

const baseEndpoint = '/courses';

export const coursesApi = {
  getAll: () => axiosInstance.get<Course[]>(baseEndpoint).then((res) => res.data),

  getById: (id: string) => axiosInstance.get<Course>(`${baseEndpoint}/${id}`).then((res) => res.data),

  create: (data: CreateCoursePayload) =>
    axiosInstance.post<Course>(baseEndpoint, data).then((res) => res.data),

  update: (id: string, data: UpdateCoursePayload) =>
    axiosInstance.put<Course>(`${baseEndpoint}/${id}`, data).then((res) => res.data),

  delete: (id: string) => axiosInstance.delete(`${baseEndpoint}/${id}`).then((res) => res.data),

  findTeams: (id: string) => axiosInstance.get(`${baseEndpoint}/${id}/teams`).then((res) => res.data),

  getMyTeam: (id: string) => axiosInstance.get(`${baseEndpoint}/${id}/my-team`).then((res) => res.data),

  findExchanges: (id: string) => axiosInstance.get(`${baseEndpoint}/${id}/exchanges`).then((res) => res.data),
};
