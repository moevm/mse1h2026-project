import { UserPayload } from '@/common/interfaces/user.interface';
import { RequestStatus } from '@/generated/prisma/enums';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class ExchangesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getRequests(courseId: string, user: UserPayload['user']) {
    const include = {
      initiatorTeam: { include: { members: { include: { user: true } }, leader: true } },
      targetTeam: { include: { members: { include: { user: true } }, leader: true } },
      initiatorProject: true,
      targetProject: true,
    };

    if (user.role === 'admin') {
      return this.prisma.exchangeRequest.findMany({ where: { courseId }, include });
    }

    const membership = await this.prisma.teamMember.findFirst({
      where: { userId: user.sub, team: { courseId } },
    });
    if (!membership) return [];

    return this.prisma.exchangeRequest.findMany({
      where: {
        courseId,
        OR: [{ initiatorTeamId: membership.teamId }, { targetTeamId: membership.teamId }],
      },
      include,
    });
  }

  async createRequest(createRequestDto: CreateRequestDto, userId: string) {
    await this.usersService.checkTeamLeader(userId, createRequestDto.initiatorTeamId);

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.exchangeRequest.create({
        data: {
          ...createRequestDto,
          status: 'confirmed_initiator',
        },
      });

      await tx.exchangeConfirmation.create({
        data: {
          exchangeRequestId: request.id,
          teamId: createRequestDto.initiatorTeamId,
          confirmedBy: userId,
        },
      });
      return request;
    });
  }

  async updateAssignments(exchangeRequestId: string, approvedBy?: string) {
    return this.prisma.$transaction(async (tx) => {
      const exchangeRequest = await tx.exchangeRequest.findUnique({
        where: { id: exchangeRequestId },
      });

      if (!exchangeRequest) {
        throw new NotFoundException(`Exchange request ${exchangeRequestId} not found.`);
      }

      await tx.team.update({
        where: { id: exchangeRequest.initiatorTeamId },
        data: {
          projectId: exchangeRequest.targetProjectId,
        },
      });

      await tx.team.update({
        where: { id: exchangeRequest.targetTeamId },
        data: {
          projectId: exchangeRequest.initiatorProjectId,
        },
      });

      await tx.assignment.updateMany({
        where: {
          teamId: exchangeRequest.initiatorTeamId,
          status: 'active',
        },
        data: {
          projectId: exchangeRequest.targetProjectId,
        },
      });

      await tx.assignment.updateMany({
        where: {
          teamId: exchangeRequest.targetTeamId,
          status: 'active',
        },
        data: {
          projectId: exchangeRequest.initiatorProjectId,
        },
      });

      return tx.exchangeRequest.update({
        where: { id: exchangeRequestId },
        data: {
          status: 'approved',
          approvedBy,
          approvedAt: new Date(),
        },
      });
    });
  }

  private getNextStatus(confirmedTeamsCount: number): RequestStatus {
    if (confirmedTeamsCount >= 2) {
      return 'pending_teacher';
    }
    return 'confirmed_target';
  }

  async confirmRequestByTeam(id: string, user: UserPayload['user']) {
    const request = await this.prisma.exchangeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Exchange request ${id} not found.`);
    }

    if (
      request.status === 'approved' ||
      request.status === 'rejected' ||
      request.status === 'cancelled'
    ) {
      throw new BadRequestException(`Exchange request ${id} is already finalized.`);
    }

    await this.usersService.checkTeamLeader(user.sub, request.targetTeamId);

    const teamId = request.targetTeamId;
    const existingConfirmation = await this.prisma.exchangeConfirmation.findFirst({
      where: {
        exchangeRequestId: id,
        teamId,
      },
    });

    if (!existingConfirmation) {
      await this.prisma.exchangeConfirmation.create({
        data: {
          exchangeRequestId: id,
          teamId,
          confirmedBy: user.sub,
        },
      });
    }

    const confirmedTeamsCount = await this.prisma.exchangeConfirmation.count({
      where: { exchangeRequestId: id },
    });

    return this.prisma.exchangeRequest.update({
      where: { id },
      data: {
        status: this.getNextStatus(confirmedTeamsCount),
      },
    });
  }

  async approveRequestByTeacher(id: string, user: UserPayload['user']) {
    const request = await this.prisma.exchangeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Exchange request ${id} not found.`);
    }

    if (request.status !== 'pending_teacher') {
      throw new BadRequestException('Both teams must confirm exchange before teacher approval.');
    }

    return this.updateAssignments(id, user.sub);
  }

  private async rejectRequest(id: string, user: UserPayload['user']) {
    const request = await this.prisma.exchangeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Exchange request ${id} not found.`);
    }

    if (
      request.status === 'approved' ||
      request.status === 'rejected' ||
      request.status === 'cancelled'
    ) {
      throw new BadRequestException(`Exchange request ${id} is already finalized.`);
    }

    if (user.role === 'student') {
      await this.usersService.checkTeamLeader(user.sub, request.targetTeamId);
    }

    return this.prisma.exchangeRequest.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }

  async updateRequest(id: string, action: 'confirm' | 'reject', user: UserPayload['user']) {
    if (action === 'reject') {
      return this.rejectRequest(id, user);
    }

    if (user.role === 'student') {
      return this.confirmRequestByTeam(id, user);
    }

    if (user.role === 'admin') {
      return this.approveRequestByTeacher(id, user);
    }

    throw new BadRequestException('Unsupported role.');
  }

  async deleteRequest(id: string, user: UserPayload['user']) {
    const request = await this.prisma.exchangeRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Exchange request ${id} not found.`);
    }

    if (
      request.status === 'approved' ||
      request.status === 'rejected' ||
      request.status === 'cancelled'
    ) {
      throw new BadRequestException(`Exchange request ${id} is already finalized.`);
    }

    if (user.role === 'student') {
      await this.usersService.checkTeamLeader(user.sub, request.initiatorTeamId);
    }

    return this.prisma.exchangeRequest.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
