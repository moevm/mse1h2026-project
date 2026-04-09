import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateCourseDto } from './dto/create-course.dto';
import { CreateTeamDto } from './dto/create-team.dto';
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

  async createCourse(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        ...dto,
      },
    });
  }

  async createTeam(id: string, dto: CreateTeamDto) {
    const course = await this.getCourseById(id);
    if (course.maxTeamSize < course.teams.length + 1) {
      throw new BadRequestException('Team size is above limit for this course.');
    }

    return this.prisma.team.create({
      data: {
        ...dto,
        courseId: id,
      },
    });
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    try {
      return await this.prisma.course.update({
        where: { id },
        data: dto,
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
}
