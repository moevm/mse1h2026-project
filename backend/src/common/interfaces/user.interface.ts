export interface User {
  uid: number;
  firstName: string;
  secondName: string;
  group?: number;
  role: 'student' | 'teacher' | 'admin';
  email: string;
  ldapUid: number;
}
