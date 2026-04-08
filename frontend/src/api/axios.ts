import { useUserStore } from '@/stores/userStore';
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор запроса
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore();
    const token = userStore.token;

    if (token && config.headers) {
      // Добавил пропущенные обратные кавычки для шаблонной строки
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Интерцептор ответа
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const userStore = useUserStore();
    const isLoginRequest = error.config?.url?.includes('/login');

    if (!isLoginRequest && error.response?.status === 401) {
      userStore.logout();
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
