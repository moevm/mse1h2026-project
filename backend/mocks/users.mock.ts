import { User } from '../src/common/interfaces/user.interface';

export const mockUsers: User[] = [
  {
    uid: 1,
    firstName: 'Иван',
    secondName: 'Иванов',
    group: 3343,
    role: 'student',
    email: 'ivan.ivanov@university.edu',
  },
  {
    uid: 2,
    firstName: 'Мария',
    secondName: 'Мариева',
    group: 3344,
    role: 'student',
    email: 'maria.marieva@university.edu',
  },
  {
    uid: 3,
    firstName: 'Сергей',
    secondName: 'Сергеев',
    role: 'teacher',
    email: 's.sergeev@university.edu',
  },
  {
    uid: 4,
    firstName: 'Михаил',
    secondName: 'Михаилов',
    role: 'admin',
    email: 'm.mihailov@university.edu',
  },
];
