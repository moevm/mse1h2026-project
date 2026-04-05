import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import axiosInstance from '@/api/axios';
import type {UserAuth } from '@/types';

class AuthError extends Error {
  public cause: unknown;
  
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'AuthError';
    this.cause = cause;
  }
}

export const useUserStore = defineStore('user', () => {
  // useStorage для role
  const role = useStorage<'admin' | 'student' | null>('userRole', null, localStorage, {
    serializer: {
      read: (value: string): 'admin' | 'student' | null =>
        value === 'admin' || value === 'student' ? value : null,
      write: (value: 'admin' | 'student' | null): string => value ?? '',
    },
  });

  // useStorage для user (сохраняем целиком)
  const user = useStorage<UserAuth | null>('user', null, localStorage, {
    serializer: {
      read: (value: string): UserAuth | null => {
        try {
          const parsed = JSON.parse(value);
          return parsed?.id ? parsed : null;
        } catch {
          return null;
        }
      },
      write: (value: UserAuth | null): string => JSON.stringify(value),
    },
  });

  // useStorage для token
  const token = useStorage<string | null>('token', null, localStorage);

  const isLoading = ref(false);

  // Геттеры
  const isAdmin = computed(() => role.value === 'admin');
  const isStudent = computed(() => role.value === 'student');
  const isRoleReady = computed(() => role.value !== null);
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  // Методы
  function setUser(data: { user: UserAuth; access_token: string }): void {
    user.value = data.user;
    token.value = data.access_token;
    role.value = data.user.role;
    
    // useStorage автоматически сохранил всё в localStorage
  }

  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true;
    try {
      const response = await axiosInstance.post<{ user: UserAuth; access_token: string }>('/auth/login', {
        email,
        password,
      });
      
      setUser(response.data)
      
    } catch (error: unknown) {
      console.error('Ошибка входа:', error);
    
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          throw new AuthError('Неверный email или пароль', error);
        } else if (axiosError.response?.status === 500) {
          throw new AuthError('Ошибка сервера. Попробуйте позже', error);
        } else if (axiosError.response?.status === 404) {
          throw new AuthError('Сервер не найден. Проверьте подключение.', error);
        }
      }
      
      throw new AuthError('Ошибка авторизации', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    user.value = null;
    token.value = null;
    role.value = null;
    
    window.location.href = '/login';
  }

  return {
    role,
    user,
    token,
    isLoading,
    isAdmin,
    isStudent,
    isRoleReady,
    isAuthenticated,
    setUser,
    login,
    logout
  };
});