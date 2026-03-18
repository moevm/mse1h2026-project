import { User } from '@/common/interfaces/user.interface';
import { mockUsers } from '@/mocks/users.mock';
import { Injectable } from '@nestjs/common';

export type UserRole = 'admin' | 'user';

export type UserAuth = {
  userId: number;
  username: string;
  password: string;
  roles: UserRole[];
};

// Переделать в данные БД
@Injectable()
export class UsersService {
  private readonly users: UserAuth[] = [
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

  async findOne(username: string): Promise<UserAuth | undefined> {
    return this.users.find((user) => user.username === username);
  }

  getUserById(id: number): User | undefined {
    return mockUsers.find((user) => user.uid === id);
  }

  getAllUsers(): User[] {
    return mockUsers;
  }

  getUsersByRole(role: string): User[] {
    return mockUsers.filter((user) => user.role === role);
  }
}
