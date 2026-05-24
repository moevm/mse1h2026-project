// api/usersApi.ts
import type { User } from '@/types';

import axiosInstance from './axios';

const baseEndpoint = '/users';

export const usersApi = {
  // Получить всех пользователей или отфильтровать по роли
  getUsers: async (role?: 'student' | 'admin'): Promise<User[]> => {
    const response = await axiosInstance.get<User[]>(baseEndpoint, {
      params: role ? { role } : undefined,
    });
    return response.data;
  },

  getAdmins: async (): Promise<User[]> => {
    return usersApi.getUsers('admin');
  },

  getStudents: async (): Promise<User[]> => {
    return usersApi.getUsers('student');
  },

  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`${baseEndpoint}/${id}`);
    return response.data;
  },
};
