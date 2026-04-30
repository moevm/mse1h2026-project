import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

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
}
