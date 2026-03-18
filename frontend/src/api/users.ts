import type { User } from '@/types';

import { apiClient } from './client';

export interface GetUsersParams {
  role?: 'user' | 'admin';
}

export const usersApi = {
  // Получить всех пользователей или отфильтровать по роли
  getUsers: async (params?: GetUsersParams): Promise<User[]> => {
    let url = '/users';

    if (params?.role) {
      url += `?role=${params.role}`;
    }

    return apiClient.get<User[]>(url);
  },

  // Получить только админов
  getAdmins: async (): Promise<User[]> => {
    return usersApi.getUsers({ role: 'admin' });
  },

  // Получить только обычных пользователей
  getRegularUsers: async (): Promise<User[]> => {
    return usersApi.getUsers({ role: 'user' });
  },

  getById: (uid: number) => apiClient.get<User>(`/users/${uid}`),
};
