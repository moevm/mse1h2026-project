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
    if (!course) throw new NotFoundException(`Team ${id} not found.`);
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
    if (team.members.length >= team.course.maxTeamSize) {
      throw new BadRequestException('Team is already full.');
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
    user: { id: string; role: string },
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
    if (team.leaderId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only team leader or admin can update team leader');
    }
    const newLeaderId = updateLeaderDto.leaderId;

    const isMember = team.members.some((member) => member.userId === newLeaderId);
    if (!isMember) {
      throw new ForbiddenException('New leader must be a member of the team');
    }
    return this.prisma.team.update({
      where: { id },
      data: updateLeaderDto,
    });
  }

  async deleteTeam(id: string) {
    try {
      return await this.prisma.team.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Team ${id} not found.`);
    }
  }

  async deleteMember(teamId: string, memberId: string) {
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
