import type { Team } from '@/types';

import axiosInstance from './axios';

export const teamsApi = {
  getMyTeam: (courseId: string) =>
    axiosInstance.get<Team | null>(`/courses/${courseId}/my-team`).then((res) => res.data),

  createTeam: (courseId: string, projectId?: string) =>
    axiosInstance.post<Team>(`/courses/${courseId}/teams`, { projectId }).then((res) => res.data),

  createInvitation: (teamId: string, inviteeId: string) =>
    axiosInstance.post(`/teams/${teamId}/invitations`, { inviteeId }).then((res) => res.data),

  leaveTeam: (teamId: string, userId: string) =>
    axiosInstance.delete(`/teams/${teamId}/members/${userId}`).then((res) => res.data),
};
