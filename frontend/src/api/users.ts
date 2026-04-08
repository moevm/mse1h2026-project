// api/usersApi.ts
import type { User } from '@/types';

import axiosInstance from './axios';

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

    const response = await axiosInstance.get<User[]>(url);
    return response.data;
  },

  getAdmins: async (): Promise<User[]> => {
    return usersApi.getUsers({ role: 'admin' });
  },

  getRegularUsers: async (): Promise<User[]> => {
    return usersApi.getUsers({ role: 'user' });
  },

  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`/users/${id}`);
    return response.data;
  },
};
