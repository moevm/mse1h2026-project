import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProjects() {
    return this.prisma.project.findMany({
      include: {
        teacher: true,
        course: true,
      },
    });
  }

  async getProjectById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        teacher: true,
        course: true,
      },
    });
    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  async createProject(projectData: {
    title: string;
    description?: string;
    teacherId: string;
    courseId: string;
  }) {
    return this.prisma.project.create({
      data: {
        title: projectData.title,
        description: projectData.description,
        teacherId: projectData.teacherId,
        courseId: projectData.courseId,
      },
    });
  }

  async updateProject(
    id: string,
    projectData: {
      title?: string;
      description?: string;
      teacherId?: string;
      courseId?: string;
    },
  ) {
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!existingProject) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return this.prisma.project.update({
      where: { id },
      data: projectData,
    });
  }

  async deleteProject(id: string) {
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!existingProject) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
