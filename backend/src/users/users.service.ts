import { Injectable } from '@nestjs/common';

export type UserRole = 'admin' | 'user';

export type User = {
  userId: number;
  username: string;
  password: string;
  roles: UserRole[];
};

// Переделать в данные БД
@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      userId: 1,
      username: 'ivan',
      password: 'ivan',
      roles: ['admin'],
    },
    {
      userId: 2,
      username: 'maria',
      password: 'maria',
      roles: ['user'],
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
