import axiosInstance from './axios';

class ApiClient {
  async get<T>(path: string): Promise<T> {
    const response = await axiosInstance.get<T>(path);
    return response.data;
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    const response = await axiosInstance.post<T>(path, data);
    return response.data;
  }

  async put<T>(path: string, data: unknown): Promise<T> {
    const response = await axiosInstance.put<T>(path, data);
    return response.data;
  }

  async delete<T>(path: string): Promise<T> {
    const response = await axiosInstance.delete<T>(path);
    return response.data;
  }
}

export const apiClient = new ApiClient();
