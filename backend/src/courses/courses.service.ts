import { UserPayload } from '@/common/interfaces/user.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersService } from '@/users/users.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AssignTeamDto } from './dto/assign-team.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getAllCourses() {
    return this.prisma.course.findMany({
      include: {
        teacher: true,
        teams: true,
        projects: true,
        exchangeRequests: true,
        imports: true,
      },
    });
  }

  async getCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: true,
        teams: true,
        projects: true,
        exchangeRequests: true,
        imports: true,
      },
    });
    if (!course) throw new NotFoundException(`Course ${id} not found.`);
    return course;
  }

  async getCourseAssignments(courseId: string) {
    return this.prisma.project.findMany({
      where: { courseId },
      include: {
        assignments: true,
      },
    });
  }

  async getCourseTeams(courseId: string) {
    return this.prisma.team.findMany({
      where: { courseId },
      include: {
        members: { include: { user: true } },
        project: true,
      },
    });
  }

  async getStudentTeam(courseId: string, userId: string) {
    const membership = await this.prisma.teamMember.findFirst({
      where: { userId, team: { courseId } },
      include: {
        team: {
          include: {
            leader: true,
            members: { include: { user: true } },
            project: true,
            invitations: { where: { status: 'pending' }, select: { id: true, inviteeId: true } },
          },
        },
      },
    });
    return membership?.team ?? null;
  }

  async getCourseExchanges(courseId: string) {
    return await this.prisma.exchangeRequest.findMany({
      where: { courseId },
    });
  }

  async createCourse(createCourseDto: CreateCourseDto) {
    return this.prisma.course.create({
      data: createCourseDto,
    });
  }

  async createTeam(courseId: string, userId: string, projectId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found.`);
    }
    const existingMembership = await this.prisma.teamMember.findFirst({
      where: { userId, team: { courseId } },
    });

    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${projectId} not found`);
      }
      if (project.courseId !== courseId) {
        throw new BadRequestException('Project does not belong to this course');
      }
    }

    if (existingMembership) {
      throw new BadRequestException('Student is already in a team.');
    }
    return this.prisma.$transaction(async (prisma) => {
      const team = await this.prisma.team.create({
        data: {
          courseId,
          leaderId: userId,
          projectId: projectId ?? null,
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

  async assignTeamManually(
    courseId: string,
    assignTeamDto: AssignTeamDto,
    user: UserPayload['user'],
  ) {
    if (user.role === 'student') {
      await this.usersService.checkTeamLeader(user.sub, assignTeamDto.teamId);
    }

    const project = await this.prisma.project.findFirst({
      where: { id: assignTeamDto.projectId, courseId },
      include: {
        assignments: true,
        teams: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${assignTeamDto.projectId} not found.`);
    }

    if (project.assignments.length > 0 || project.teams.length > 0) {
      throw new ConflictException('Assignment or team already exist for given team.');
    }

    const team = await this.prisma.team.findFirst({
      where: { id: assignTeamDto.teamId, courseId },
    });

    if (!team) {
      throw new NotFoundException(`Team ${assignTeamDto.teamId} not found.`);
    }

    if (team.projectId) {
      throw new ConflictException('Team is already assigned to a project.');
    }

    return this.prisma.$transaction(async (prisma) => {
      await prisma.team.update({
        where: { id: assignTeamDto.teamId },
        data: { projectId: assignTeamDto.projectId, status: 'assigned' },
      });

      return prisma.assignment.create({
        data: assignTeamDto,
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

    return { message: 'Teams assigned to projects successfully.', assignedTeamIds: ids };
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto) {
    try {
      return await this.prisma.course.update({
        where: { id },
        data: updateCourseDto,
      });
    } catch {
      throw new NotFoundException(`Course ${id} not found.`);
    }
  }

  async deleteCourse(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException(`Course ${id} not found.`);

    return this.prisma.$transaction(async (tx) => {
      const teamIds = (
        await tx.team.findMany({ where: { courseId: id }, select: { id: true } })
      ).map((t) => t.id);

      await tx.exchangeConfirmation.deleteMany({ where: { teamId: { in: teamIds } } });
      await tx.exchangeRequest.deleteMany({ where: { courseId: id } });
      await tx.assignment.deleteMany({ where: { teamId: { in: teamIds } } });
      await tx.teamInvitation.deleteMany({ where: { teamId: { in: teamIds } } });
      await tx.teamMember.deleteMany({ where: { teamId: { in: teamIds } } });
      await tx.team.deleteMany({ where: { courseId: id } });
      await tx.import.deleteMany({ where: { courseId: id } });
      await tx.project.deleteMany({ where: { courseId: id } });
      return tx.course.delete({ where: { id } });
    });
  }
}
