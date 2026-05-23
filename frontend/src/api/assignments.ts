import type { Assignment, AutoAssignPayload, ManuallyAssignPayload } from '@/types';

import axiosInstance from './axios';

const baseEndpoint = '/assignments';

export const assignmentsApi = {
  getAll: (courseId: string) =>
    axiosInstance.get<Assignment[]>(baseEndpoint, { params: { courseId } }).then((res) => res.data),
  assignTeamManually: (assignTeamPayload: ManuallyAssignPayload) =>
    axiosInstance.post(`${baseEndpoint}/manual`, assignTeamPayload).then((res) => res.data),
  assignTeamAutomatically: (autoAssignPayload: AutoAssignPayload) =>
    axiosInstance.post(`${baseEndpoint}/auto`, autoAssignPayload).then((res) => res.data),
  delete: (assignmentId: string) =>
    axiosInstance.delete(`${baseEndpoint}/${assignmentId}`).then((res) => res.data),
};
