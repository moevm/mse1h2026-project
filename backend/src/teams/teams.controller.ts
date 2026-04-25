import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

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
  createInvitation(@Param('id') teamId: string, @Body() createInvitationDto: CreateInvitationDto) {
    return this.teamsService.createInvitation(teamId, createInvitationDto);
  }

  // не хватает роли лидера или как-то ещё обозначить
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Put(':id')
  updateLeader(@Param('id') id: string, @Body() updateLeaderDto: UpdateLeaderDto) {
    return this.teamsService.updateTeamLeader(id, updateLeaderDto);
  }

  // тут тоже
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.teamsService.deleteTeam(id);
  }

  @Delete(':teamId/members/:userId')
  deleteMember(@Param('teamId') teamId: string, @Param('userId') userId: string) {
    return this.teamsService.deleteMember(teamId, userId);
  }
}
