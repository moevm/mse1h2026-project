import { User } from '../src/common/interfaces/user.interface';

export const mockUsers: User[] = [
  {
    uid: 1,
    firstName: 'Иван',
    secondName: 'Иванов',
    group: 3343,
    role: 'student',
    email: 'ivan.ivanov@university.edu',
    ldapUid: 1,
  },
  {
    uid: 2,
    firstName: 'Мария',
    secondName: 'Мариева',
    group: 3344,
    role: 'student',
    email: 'maria.marieva@university.edu',
    ldapUid: 23,
  },
  {
    uid: 3,
    firstName: 'Сергей',
    secondName: 'Сергеев',
    role: 'teacher',
    email: 's.sergeev@university.edu',
    ldapUid: 123,
  },
  {
    uid: 4,
    firstName: 'Михаил',
    secondName: 'Михаилов',
    role: 'admin',
    email: 'm.mihailov@university.edu',
    ldapUid: 100,
  },
];
