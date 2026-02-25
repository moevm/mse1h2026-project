export interface User {
  uid: number;
  first_name: string;
  second_name: string;
  group?: number;
  role: 'student' | 'teacher' | 'admin';
  email: string;
}
