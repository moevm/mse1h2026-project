import { UserPayload } from '@/common/interfaces/user.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateCourseDto } from './dto/create-course.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';

@Injectable()
export class TeamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getTeamById(id: string) {
    const team = await this.prisma.team.findUnique({
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
        project: true,
      },
    });
    if (!team) {
      throw new NotFoundException(`Team ${id} not found.`);
    }
    return team;
  }

  async createTeam(createCourseDto: CreateCourseDto, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: createCourseDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course ${createCourseDto.courseId} not found.`);
    }
    const existingMembership = await this.prisma.teamMember.findFirst({
      where: { userId, team: { courseId: createCourseDto.courseId } },
    });

    if (createCourseDto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: createCourseDto.projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${createCourseDto.projectId} not found`);
      }
      if (project.courseId !== createCourseDto.courseId) {
        throw new BadRequestException('Project does not belong to this course');
      }
    }

    if (existingMembership) {
      throw new BadRequestException('Student is already in a team.');
    }
    return this.prisma.$transaction(async (prisma) => {
      const team = await this.prisma.team.create({
        data: {
          courseId: createCourseDto.courseId,
          leaderId: userId,
          projectId: createCourseDto.projectId ?? null,
          status: 'forming',
        },
      });
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: userId,
        },
      });
      return team;
    });
  }

  async createInvitation(teamId: string, createInvitationDto: CreateInvitationDto, userId: string) {
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
    await this.usersService.checkTeamLeader(userId, teamId);
    const invitee = await this.prisma.user.findUnique({
      where: { id: createInvitationDto.inviteeId },
      select: { id: true, role: true },
    });
    if (!invitee) {
      throw new NotFoundException(`User ${createInvitationDto.inviteeId} not found.`);
    }
    if (invitee.role !== 'student') {
      throw new BadRequestException('Only students can be invited to teams.');
    }
    const isMember = await this.prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: createInvitationDto.inviteeId,
      },
    });
    if (isMember) {
      throw new BadRequestException('User already in team.');
    }
    if (team.members.length >= team.course.maxTeamSize) {
      throw new BadRequestException('Team is already full.');
    }
    if (!team.leaderId) {
      throw new BadRequestException('Team has no leader.');
    }
    const existingInvitation = await this.prisma.teamInvitation.findFirst({
      where: {
        teamId,
        inviteeId: createInvitationDto.inviteeId,
        status: 'pending',
      },
    });
    if (existingInvitation) {
      throw new BadRequestException('Pending invitation already exists for this user.');
    }
    return this.prisma.teamInvitation.create({
      data: {
        teamId,
        inviteeId: createInvitationDto.inviteeId,
        invitedBy: team.leaderId!,
      },
    });
  }

  async updateTeamLeader(
    teamId: string,
    updateLeaderDto: UpdateLeaderDto,
    user: UserPayload['user'],
  ) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
      },
    });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }
    if (user.role !== 'admin') {
      await this.usersService.checkTeamLeader(user.sub, teamId);
    }
    const newLeaderId = updateLeaderDto.leaderId;

    const isMember = team.members.some((member) => member.userId === newLeaderId);
    if (!isMember) {
      throw new ForbiddenException('New leader must be a member of the team.');
    }
    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        leaderId: updateLeaderDto.leaderId,
      },
    });
  }

  async deleteTeam(teamId: string, user: UserPayload['user']) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }
    if (team.leaderId !== user.sub && user.role !== 'admin') {
      throw new ForbiddenException('Only leader or admin can delete team.');
    }
    return this.prisma.$transaction(async (prisma) => {
      const requests = await prisma.exchangeRequest.findMany({
        where: {
          OR: [{ initiatorTeamId: teamId }, { targetTeamId: teamId }],
        },
        select: { id: true },
      });

      const requestIds = requests.map((request) => request.id);

      if (requestIds.length > 0) {
        await prisma.exchangeConfirmation.deleteMany({
          where: {
            OR: [{ teamId }, { exchangeRequestId: { in: requestIds } }],
          },
        });
      } else {
        await prisma.exchangeConfirmation.deleteMany({
          where: { teamId },
        });
      }

      await prisma.exchangeRequest.deleteMany({
        where: {
          OR: [{ initiatorTeamId: teamId }, { targetTeamId: teamId }],
        },
      });

      await prisma.assignment.deleteMany({
        where: { teamId },
      });

      await prisma.teamInvitation.deleteMany({
        where: { teamId },
      });

      await prisma.teamMember.deleteMany({
        where: { teamId },
      });

      return prisma.team.delete({
        where: { id: teamId },
      });
    });
  }

  async addMember(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { course: true, members: true },
    });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }
    if (team.members.length >= team.course.maxTeamSize) {
      throw new BadRequestException('Team is already full.');
    }
    const existingMembership = await this.prisma.teamMember.findFirst({
      where: { userId, team: { courseId: team.courseId } },
    });
    if (existingMembership) {
      throw new BadRequestException('Student is already in a team.');
    }
    return this.prisma.teamMember.create({
      data: { teamId, userId },
    });
  }

  async deleteMember(teamId: string, memberId: string, user: UserPayload['user']) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }
    if (memberId === team.leaderId) {
      throw new BadRequestException('Leader cannot be removed from team.');
    }
    if (team.leaderId !== user.sub && memberId !== user.sub && user.role !== 'admin') {
      throw new ForbiddenException('Only team leader can remove other members.');
    }
    const member = await this.prisma.teamMember.findFirst({
      where: {
        teamId: teamId,
        userId: memberId,
      },
    });
    if (!member) {
      throw new NotFoundException(`User ${memberId} is not in team ${teamId}.`);
    }
    return this.prisma.teamMember.delete({
      where: { id: member.id },
    });
  }
}
