import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';

import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import { TeamsService } from './teams.service';

@Controller('api/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.getTeamById(id);
  }

  // + роль
  @Post(':id/invitations')
  createInvitation(
    @Param('id') teamId: string,
    @Body() createInvitationDto: CreateInvitationDto,
    @Req() req,
  ) {
    return this.teamsService.createInvitation(teamId, createInvitationDto, req.user.sub);
  }

  @Put(':id')
  updateLeader(@Param('id') id: string, @Body() dto: UpdateLeaderDto, @Req() req) {
    return this.teamsService.updateTeamLeader(id, dto, req.user);
  }

  // тут тоже
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.teamsService.deleteTeam(id, req.user);
  }

  @Delete(':teamId/members/:userId')
  deleteMember(@Param('teamId') teamId: string, @Param('userId') userId: string, @Req() req) {
    return this.teamsService.deleteMember(teamId, userId, req.user);
  }
}
