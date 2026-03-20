import { Injectable } from '@nestjs/common';

export type UserRole = 'admin' | 'user';

export type User = {
  userId: number;
  email: string;
  password: string;
  roles: UserRole[];
};

// Переделать в данные БД
@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      userId: 1,
      email: 'ivan@mail.com',
      password: 'ivan',
      roles: ['admin'],
    },
    {
      userId: 2,
      email: 'maria@mail.com',
      password: 'maria',
      roles: ['user'],
    },
  ];

  async findOne(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }
}
