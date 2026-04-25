import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateInvitation(id: string, updateInvitationDto: UpdateInvitationDto) {
    try {
      return await this.prisma.teamInvitation.update({
        where: { id },
        data: updateInvitationDto,
      });
    } catch {
      throw new NotFoundException(`Invitation ${id} not found.`);
    }
  }
}
