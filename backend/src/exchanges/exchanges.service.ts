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

  async confirmRequest(id: string, role: string) {
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
        await this.prisma.exchangeRequest.update({
          where: { id },
          data: {
            status: 'approved',
          },
        });

        // поменять проекты местами
        // this.updateAssignments();
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
