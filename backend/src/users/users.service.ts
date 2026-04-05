import { User } from '@/common/interfaces/user.interface';
import { mockUsers } from '@/mocks/users.mock';
import { Injectable } from '@nestjs/common';

export type UserRole = 'admin' | 'user';

export type UserAuth = {
  userId: number;
  email: string;
  password: string;
  role: UserRole;
};

// Переделать в данные БД
@Injectable()
export class UsersService {
  private readonly users: UserAuth[] = [
    {
      userId: 1,
      email: 'ivan@mail.com',
      password: 'ivan',
      role: 'admin',
    },
    {
      userId: 2,
      email: 'maria@mail.com',
      password: 'maria',
      role: 'user',
    },
  ];

  async findOne(email: string): Promise<UserAuth | undefined> {
    return this.users.find((user) => user.email === email);
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
