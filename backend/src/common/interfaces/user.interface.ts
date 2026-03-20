export interface User {
  uid: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'admin';
  group?: number;
  ldapUid: number;
}
