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
