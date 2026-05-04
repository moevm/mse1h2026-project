import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class ExchangesService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(createRequestDto: CreateRequestDto) {
    return await this.prisma.exchangeRequest.create({
      data: createRequestDto,
    });
  }

  async updateAssignments(exchangeRequestId: string, approvedBy?: string) {
    return await this.prisma.$transaction(async (tx) => {
      const exchangeRequest = await tx.exchangeRequest.findUnique({
        where: { id: exchangeRequestId },
      });

      if (!exchangeRequest) {
        throw new NotFoundException(`Exchange request ${exchangeRequestId} not found.`);
      }

      await tx.team.update({
        where: { id: exchangeRequest.initiatorTeamId },
        data: {
          projectId: exchangeRequest.targetProjectId,
        },
      });

      await tx.team.update({
        where: { id: exchangeRequest.targetTeamId },
        data: {
          projectId: exchangeRequest.initiatorProjectId,
        },
      });

      await tx.assignment.updateMany({
        where: {
          teamId: exchangeRequest.initiatorTeamId,
          status: 'active',
        },
        data: {
          projectId: exchangeRequest.targetProjectId,
        },
      });

      await tx.assignment.updateMany({
        where: {
          teamId: exchangeRequest.targetTeamId,
          status: 'active',
        },
        data: {
          projectId: exchangeRequest.initiatorProjectId,
        },
      });

      return await tx.exchangeRequest.update({
        where: { id: exchangeRequestId },
        data: {
          status: 'approved',
          approvedBy,
          approvedAt: new Date(),
        },
      });
    });
  }

  async confirmRequest(id: string, role: string, approvedBy?: string) {
    try {
      if (role === 'student') {
        return await this.prisma.exchangeRequest.update({
          where: { id },
          data: {
            status: 'confirmed_target',
          },
        });
      }

      if (role === 'admin') {
        return await this.updateAssignments(id, approvedBy);
      }
    } catch {
      throw new NotFoundException(`Exchange request ${id} not found.`);
    }
  }

  async deleteRequest(id: string) {
    try {
      return await this.prisma.exchangeRequest.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`Exchange request ${id} not found.`);
    }
  }
}
