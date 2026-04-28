import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeamById(id: string) {
    const course = await this.prisma.team.findUnique({
      where: { id },
      include: {
        course: true,
        leader: true,
        members: true,
        assignments: true,
        invitations: true,
        initiatedExchanges: true,
        targetedExchanges: true,
        exchangeConfirmations: true,
      },
    });
    if (!course) {
      throw new NotFoundException(`Team ${id} not found.`);
    }
      return course;
  }

  async createInvitation(teamId: string, dto: CreateInvitationDto, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        course: true,
        members: true,
      },
    });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }
    if (team.leaderId !== userId) {
      throw new ForbiddenException('You have not rights for this team.');
    }
    const invitee = await this.prisma.user.findUnique({
      where: { id: dto.inviteeId },
      select: { id: true, role: true },
    });
    if (!invitee) {
      throw new NotFoundException(`User ${dto.inviteeId} not found.`);
    }
    if (invitee.role !== 'student') {
      throw new BadRequestException('Only students can be invited to teams.');
    }
    const isMember = await this.prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: dto.inviteeId,
      },
    });
    if (isMember) {
      throw new BadRequestException('User already in team');
    }
    if (team.members.length >= team.course.maxTeamSize) {
      throw new BadRequestException('Team is already full.');
    }
    if (!team.leaderId) {
      throw new BadRequestException('Team has no leader');
    }
    const existingInvitation = await this.prisma.teamInvitation.findFirst({
      where: {
        teamId,
        inviteeId: dto.inviteeId,
        status: 'pending',
      },
    });
    if (existingInvitation) {
      throw new BadRequestException('Pending invitation already exists for this user.');
    }
    return this.prisma.teamInvitation.create({
      data: {
        teamId,
        inviteeId: dto.inviteeId,
        invitedBy: team.leaderId!,
      },
    });
  }

  async updateTeamLeader(
    id: string,
    updateLeaderDto: UpdateLeaderDto,
    user: { sub: string; role: string },
  ) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });
    if (!team) {
      throw new NotFoundException(`Team ${id} not found.`);
    }
    if (team.leaderId !== user.sub && user.role !== 'admin') {
      throw new ForbiddenException('Only team leader or admin can update team leader');
    }
    const newLeaderId = updateLeaderDto.leaderId;

    const isMember = team.members.some((member) => member.userId === newLeaderId);
    if (!isMember) {
      throw new ForbiddenException('New leader must be a member of the team');
    }
    return this.prisma.team.update({
      where: { id },
      data: {
        leaderId: updateLeaderDto.leaderId,
      },
    });
  }

  async deleteTeam(id: string, user: { sub: string; role: string }) {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });
    if (!team) {
      throw new NotFoundException(`Team ${id} not found.`);
    }
    if (team.leaderId !== user.sub && user.role !== 'admin') {
      throw new ForbiddenException('Only leader or admin can delete team');
    }
    return this.prisma.$transaction(async (prisma) => {
      const requests = await prisma.exchangeRequest.findMany({
        where: {
          OR: [{ initiatorTeamId: id }, { targetTeamId: id }],
        },
        select: { id: true },
      });

      const requestIds = requests.map((request) => request.id);

      if (requestIds.length > 0) {
        await prisma.exchangeConfirmation.deleteMany({
          where: {
            OR: [{ teamId: id }, { exchangeRequestId: { in: requestIds } }],
          },
        });
      } else {
        await prisma.exchangeConfirmation.deleteMany({
          where: { teamId: id },
        });
      }

      await prisma.exchangeRequest.deleteMany({
        where: {
          OR: [{ initiatorTeamId: id }, { targetTeamId: id }],
        },
      });

      await prisma.assignment.deleteMany({
        where: { teamId: id },
      });

      await prisma.teamInvitation.deleteMany({
        where: { teamId: id },
      });

      await prisma.teamMember.deleteMany({
        where: { teamId: id },
      });

      return prisma.team.delete({
        where: { id },
      });
    });
  }

  async deleteMember(teamId: string, memberId: string, user: { sub: string; role: string }) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }
    if (memberId === team.leaderId) {
      throw new BadRequestException('Leader cannot be removed from team');
    }
    if (team.leaderId !== user.sub) {
      throw new ForbiddenException('Only team leader can remove members');
    }
    const member = await this.prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: memberId,
      },
    });
    if (!member) {
      throw new NotFoundException(`User ${memberId} is not in team ${teamId}`);
    }
    return this.prisma.teamMember.delete({
      where: { id: member.id },
    });
  }
}
