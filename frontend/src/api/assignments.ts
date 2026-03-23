import type { Assignment } from '@/types';

import { apiClient } from './client';

export const assignmentsApi = {
  getAll: () => apiClient.get<Assignment[]>('/assignments'),
};
