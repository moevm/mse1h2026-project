import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common';

import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { InvitationsService } from './invitations.service';

@Controller('api/invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('my')
  getMyInvitations(@Req() req) {
    return this.invitationsService.getMyInvitations(req.user.sub);
  }

  @Put(':id')
  updateInvitation(@Param('id') id: string, @Body() updateInvitationDto: UpdateInvitationDto) {
    return this.invitationsService.updateInvitation(id, updateInvitationDto);
  }
}
