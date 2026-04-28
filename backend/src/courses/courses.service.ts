import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCourses() {
    return await this.prisma.course.findMany({
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
    return await this.prisma.course.create({
      data: {
        ...createCourseDto,
      },
    });
  }

  async createTeam(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found.`);
    }
    const existingMembership = await this.prisma.teamMember.findFirst({
      where: { userId },
    });

    if (existingMembership) {
      throw new BadRequestException('Student is already in a team.');
    }
    return this.prisma.$transaction(async (prisma) => {
      const team = await prisma.team.create({
        data: {
          courseId,
          leaderId: userId,
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

  async getCourseTeams(courseId: string) {
    return this.prisma.team.findMany({
      where: { courseId },
      include: { members: true },
    });
  }
}
