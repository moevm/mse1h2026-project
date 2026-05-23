import type { ExchangeRequest } from '@/types';

import axiosInstance from './axios';

interface CreateExchangeRequestData {
  courseId: string;
  initiatorTeamId: string;
  targetTeamId: string;
  initiatorProjectId: string;
  targetProjectId: string;
}

export const exchangesApi = {
  getRequests: (courseId: string) =>
    axiosInstance
      .get<ExchangeRequest[]>('/exchanges/requests', { params: { courseId } })
      .then((res) => res.data),

  createRequest: (data: CreateExchangeRequestData) =>
    axiosInstance.post<ExchangeRequest>('/exchanges/requests', data).then((res) => res.data),

  confirmRequest: (id: string) =>
    axiosInstance
      .put<ExchangeRequest>(`/exchanges/requests/${id}`, { action: 'confirm' })
      .then((res) => res.data),

  rejectRequest: (id: string) =>
    axiosInstance
      .put<ExchangeRequest>(`/exchanges/requests/${id}`, { action: 'reject' })
      .then((res) => res.data),

  cancelRequest: (id: string) =>
    axiosInstance.delete<ExchangeRequest>(`/exchanges/requests/${id}`).then((res) => res.data),
};
