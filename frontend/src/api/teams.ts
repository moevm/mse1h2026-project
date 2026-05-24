import type { CreateTeamPayload, Team } from '@/types';

import axiosInstance from './axios';

const baseEndpoint = '/teams';

export const teamsApi = {
  getMyTeam: (courseId: string) =>
    axiosInstance.get<Team | null>(`/courses/${courseId}/my-team`).then((res) => res.data),

  getCourseTeams: (courseId: string) =>
    axiosInstance.get<Team[]>(`/courses/${courseId}/teams`).then((res) => res.data),

  createTeam: (payload: CreateTeamPayload) =>
    axiosInstance.post<Team>(baseEndpoint, payload).then((res) => res.data),

  createInvitation: (teamId: string, inviteeId: string) =>
    axiosInstance
      .post(`${baseEndpoint}/${teamId}/invitations`, { inviteeId })
      .then((res) => res.data),

  leaveTeam: (teamId: string, userId: string) =>
    axiosInstance.delete(`${baseEndpoint}/${teamId}/members/${userId}`).then((res) => res.data),

  addMember: (teamId: string, userId: string) =>
    axiosInstance.post(`${baseEndpoint}/${teamId}/members`, { userId }).then((res) => res.data),
};
