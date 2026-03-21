import { User } from '@/common/interfaces/user.interface';

export const mockUsers: User[] = [
  {
    uid: 1,
    firstName: 'Иван',
    lastName: 'Иванов',
    group: 3343,
    role: 'student',
    email: 'ivan.ivanov@university.edu',
    ldapUid: 1,
  },
  {
    uid: 2,
    firstName: 'Мария',
    lastName: 'Мариева',
    group: 3344,
    role: 'student',
    email: 'maria.marieva@university.edu',
    ldapUid: 23,
  },
  {
    uid: 3,
    firstName: 'Сергей',
    lastName: 'Сергеев',
    role: 'admin',
    email: 's.sergeev@university.edu',
    ldapUid: 123,
  },
  {
    uid: 4,
    firstName: 'Михаил',
    lastName: 'Михаилов',
    role: 'admin',
    email: 'm.mihailov@university.edu',
    ldapUid: 100,
  },
];
