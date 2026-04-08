import type { Assignment } from '@/types';

import axiosInstance from './axios';

export const assignmentsApi = {
  getAll: () => axiosInstance.get<Assignment[]>('/assignments').then((res) => res.data),
};
