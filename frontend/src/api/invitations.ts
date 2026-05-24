import type { TeamInvitation } from '@/types';

import axiosInstance from './axios';

const baseEndpoint = '/invitations';

export const invitationsApi = {
  getMyInvitations: () =>
    axiosInstance.get<TeamInvitation[]>(`${baseEndpoint}/my`).then((res) => res.data),

  updateInvitation: (id: string, status: 'accepted' | 'declined' | 'cancelled') =>
    axiosInstance.put(`${baseEndpoint}/${id}`, { status }).then((res) => res.data),
};
