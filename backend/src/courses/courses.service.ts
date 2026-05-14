import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

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
