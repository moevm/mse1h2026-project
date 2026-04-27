import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

export type UserRole = 'admin' | 'student';

export type UserAuth = {
  id: string;
  email: string;
  password: string;
  role: UserRole;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(email: string): Promise<UserAuth | undefined> {
    const user = await this.prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
      },
    });

    if (!user?.password) {
      return undefined;
    }

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role,
    };
  }

  getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        secondName: true,
        email: true,
        groupNumber: true,
        role: true,
        ldapUid: true,
      },
    });
  }

  getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        secondName: true,
        email: true,
        groupNumber: true,
        role: true,
        ldapUid: true,
      },
    });
  }

  getUsersByRole(role: UserRole) {
    return this.prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        firstName: true,
        secondName: true,
        email: true,
        groupNumber: true,
        role: true,
        ldapUid: true,
      },
    });
  }
}
