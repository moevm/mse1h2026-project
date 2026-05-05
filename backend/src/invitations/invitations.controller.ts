import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';

import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { InvitationsService } from './invitations.service';

@Controller('api/invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('my')
  getMyInvitations(@Req() req) {
    return this.invitationsService.getMyInvitations(req.user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles(['student'])
  @Put(':id')
  updateInvitation(@Param('id') id: string, @Body() updateInvitationDto: UpdateInvitationDto) {
    return this.invitationsService.updateInvitation(id, updateInvitationDto);
  }
}
