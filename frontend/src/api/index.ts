import type { Course } from '../types/index.ts'

const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
  // Курсы
  async getCourses(): Promise<Course[]> {
    const response = await fetch(`${API_BASE_URL}/courses`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  async getCourseById(uid: number): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/courses/${uid}`);
    if (!response.ok) throw new Error('Failed to fetch course');
    return response.json();
  }
};