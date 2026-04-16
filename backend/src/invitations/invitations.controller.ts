import { Body, Controller, Param, Put } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Put(':id')
  updateInvitation(@Param('id') id: string, @Body() updateInvitationDto: UpdateInvitationDto) {
    return this.invitationsService.updateInvitation(id, updateInvitationDto);
  }
}
