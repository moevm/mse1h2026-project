import { PrismaService } from '@/prisma/prisma.service';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

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

  async getAllUsers() {
    return await this.prisma.user.findMany({
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

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({
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

  async getUsersByRole(role: UserRole) {
    return await this.prisma.user.findMany({
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

  async checkTeamLeader(userId: string, teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }
    if (team.leaderId !== userId) {
      throw new ForbiddenException('You have no rights for this team.');
    }
  }
}
