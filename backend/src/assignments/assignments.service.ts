import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllAssignments() {
    return this.prisma.assignment.findMany({
      include: {
        team: true,
        project: true,
      },
    });
  }

  async deleteAssignment(id: string) {
    try {
      return await this.prisma.assignment.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Assignment ${id} not found.`);
    }
  }
}
