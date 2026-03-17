export interface User {
  uid: number;
  firstName: string;
  secondName: string;
  group?: number;
  role: 'student' | 'admin';
  email: string;
  ldapUid: number;
}
