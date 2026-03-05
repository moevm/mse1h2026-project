import { Injectable } from '@nestjs/common';

export type User = any;

// Переделать в данные БД
@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'ivan',
      password: 'ivan',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'maria',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
