import type { TeamInvitation } from '@/types';

import axiosInstance from './axios';

export const invitationsApi = {
  getMyInvitations: () =>
    axiosInstance.get<TeamInvitation[]>('/invitations/my').then((res) => res.data),

  updateInvitation: (id: string, status: 'accepted' | 'declined') =>
    axiosInstance.put(`/invitations/${id}`, { status }).then((res) => res.data),
};
