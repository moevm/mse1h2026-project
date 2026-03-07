import { apiClient } from './client';
import type { Assignment } from '../types';

export const assignmentsApi = {
  getAll: () => apiClient.get<Assignment[]>('/assignments'),
};