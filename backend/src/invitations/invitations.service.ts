import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateInvitation(id: string, updateInvitationDto: UpdateInvitationDto) {
    try {
      const respondedAt = updateInvitationDto.status === 'pending' ? null : new Date();

      return await this.prisma.teamInvitation.update({
        where: { id },
        data: {
          status: updateInvitationDto.status,
          respondedAt,
        },
      });
    } catch {
      throw new NotFoundException(`Invitation ${id} not found.`);
    }
  }
}
