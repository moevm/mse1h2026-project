import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateLeaderDto } from './dto/update-leader.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeamById(id: string) {
    const course = await this.prisma.team.findUnique({
      where: { id },
      include: {
        course: true,
        leader: true,
        members: true,
        assignments: true,
        invitations: true,
        initiatedExchanges: true,
        targetedExchanges: true,
        exchangeConfirmations: true,
      },
    });
    if (!course) throw new NotFoundException(`Team ${id} not found.`);
    return course;
  }

  async updateTeamLeader(id: string, dto: UpdateLeaderDto) {
    try {
      return await this.prisma.team.update({
        where: { id },
        data: dto,
      });
    } catch {
      throw new NotFoundException(`Team ${id} not found.`);
    }
  }

  async deleteTeam(id: string) {
    try {
      return await this.prisma.team.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Team ${id} not found.`);
    }
  }
}