import { User } from '../src/common/interfaces/user.interface';

export const mockUsers: User[] = [
  {
    uid: 1,
    first_name: 'Иван',
    second_name: 'Иванов',
    group: 3343,
    role: 'student',
    email: 'ivan.ivanov@university.edu',
  },
  {
    uid: 2,
    first_name: 'Мария',
    second_name: 'Мариева',
    group: 3344,
    role: 'student',
    email: 'maria.marieva@university.edu',
  },
  {
    uid: 3,
    first_name: 'Сергей',
    second_name: 'Сергеев',
    role: 'teacher',
    email: 's.sergeev@university.edu',
  },
  {
    uid: 4,
    first_name: 'Михаил',
    second_name: 'Михаилов',
    role: 'admin',
    email: 'm.mihailov@university.edu',
  },
];
