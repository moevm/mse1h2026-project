import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyInvitations(userId: string) {
    return this.prisma.teamInvitation.findMany({
      where: { inviteeId: userId, status: 'pending' },
      include: {
        team: {
          include: {
            course: true,
            leader: true,
          },
        },
      },
    });
  }

  async updateInvitation(id: string, updateInvitationDto: UpdateInvitationDto) {
    try {
      const respondedAt = updateInvitationDto.status === 'pending' ? null : new Date();

      const invitation = await this.prisma.teamInvitation.update({
        where: { id },
        data: {
          status: updateInvitationDto.status,
          respondedAt,
        },
      });

      if (updateInvitationDto.status === 'accepted') {
        const existingMembership = await this.prisma.teamMember.findFirst({
          where: { userId: invitation.inviteeId },
        });
        if (!existingMembership) {
          await this.prisma.teamMember.create({
            data: {
              teamId: invitation.teamId,
              userId: invitation.inviteeId,
            },
          });
        }
      }

      return invitation;
    } catch {
      throw new NotFoundException(`Invitation ${id} not found.`);
    }
  }
}
