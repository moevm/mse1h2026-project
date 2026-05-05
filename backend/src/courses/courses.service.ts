import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

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
    try {
      return await this.prisma.course.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Course ${id} not found.`);
    }
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
            invitations: { where: { status: 'pending' }, select: { inviteeId: true } },
          },
        },
      },
    });
    return membership?.team ?? null;
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
}
