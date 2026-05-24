import { UserPayload } from '@/common/interfaces/user.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ManuallyAssignDto } from './dto/manually-assign.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getCourseAssignments(courseId: string) {
    return this.prisma.project.findMany({
      where: { courseId },
      include: {
        assignments: true,
      },
    });
  }

  async assignTeamManually(assignTeamDto: ManuallyAssignDto, user: UserPayload['user']) {
    if (user.role === 'student') {
      await this.usersService.checkTeamLeader(user.sub, assignTeamDto.teamId);
    }

    const project = await this.prisma.project.findFirst({
      where: { id: assignTeamDto.projectId, courseId: assignTeamDto.courseId },
      include: {
        course: true,
        assignments: true,
        teams: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${assignTeamDto.projectId} not found.`);
    }

    if (project.course.registrationDeadline && project.course.registrationDeadline < new Date()) {
      throw new BadRequestException('Course deadline is overdue.');
    }

    if (project.assignments.length > 0 || project.teams.length > 0) {
      throw new ConflictException('Assignment or team already exist for given team.');
    }

    const team = await this.prisma.team.findFirst({
      where: { id: assignTeamDto.teamId, courseId: assignTeamDto.courseId },
    });

    if (!team) {
      throw new NotFoundException(`Team ${assignTeamDto.teamId} not found.`);
    }

    if (team.projectId) {
      throw new ConflictException('Team is already assigned to a project.');
    }

    if (project.courseId !== team.courseId) {
      throw new BadRequestException('Project and team courseId does not match.');
    }

    return this.prisma.$transaction(async (prisma) => {
      await prisma.team.update({
        where: { id: assignTeamDto.teamId },
        data: { projectId: assignTeamDto.projectId, status: 'assigned' },
      });

      return prisma.assignment.create({
        data: {
          projectId: assignTeamDto.projectId,
          teamId: assignTeamDto.teamId,
          status: assignTeamDto.status,
          approvedBy: assignTeamDto.approvedBy,
          approvedAt: assignTeamDto.approvedAt,
        },
      });
    });
  }

  async assignTeamAutomatically(courseId: string) {
    const teams = await this.prisma.team.findMany({
      where: { projectId: null, courseId },
    });

    const projects = await this.prisma.project.findMany({
      where: {
        courseId,
        assignments: { none: {} },
        teams: { none: {} },
      },
    });

    if (teams.length === 0 || projects.length === 0) {
      throw new BadRequestException('No available teams or projects for assignment.');
    }

    if (teams.length > projects.length) {
      throw new BadRequestException('Not enough projects for all teams.');
    }

    const ids = teams.map((team) => team.id);
    await this.prisma.$transaction(
      teams.flatMap((team, index) => [
        this.prisma.team.update({
          where: { id: team.id },
          data: { projectId: projects[index].id, status: 'assigned' },
        }),
        this.prisma.assignment.create({
          data: {
            projectId: projects[index].id,
            teamId: team.id,
            status: 'active',
          },
        }),
      ]),
    );

    return ids;
  }

  async deleteAssignment(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        team: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment ${id} not found.`);
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.team.update({
        where: { id: assignment.teamId },
        data: {
          projectId: null,
          status: 'forming',
        },
      });

      await prisma.assignment.delete({
        where: { id },
      });
    });
  }
}
