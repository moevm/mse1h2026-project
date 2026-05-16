import type { CreateTeamPayload, Team } from '@/types';

import axiosInstance from './axios';

export const teamsApi = {
  getMyTeam: (courseId: string) =>
    axiosInstance.get<Team | null>(`/courses/${courseId}/my-team`).then((res) => res.data),

  getCourseTeams: (courseId: string) =>
    axiosInstance.get<Team[]>(`/courses/${courseId}/teams`).then((res) => res.data),

  createTeam: ({ courseId, projectId }: CreateTeamPayload) =>
    axiosInstance.post<Team>('/teams', { courseId, projectId }).then((res) => res.data),

  createInvitation: (teamId: string, inviteeId: string) =>
    axiosInstance.post(`/teams/${teamId}/invitations`, { inviteeId }).then((res) => res.data),

  leaveTeam: (teamId: string, userId: string) =>
    axiosInstance.delete(`/teams/${teamId}/members/${userId}`).then((res) => res.data),
};
