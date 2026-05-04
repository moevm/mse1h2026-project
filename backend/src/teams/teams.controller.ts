import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';

import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateLeaderDto } from './dto/update-leader.dto';
import { TeamsService } from './teams.service';

@Controller('api/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.getTeamById(id);
  }

  @UseGuards(RolesGuard)
  @Roles(['student'])
  @Post(':id/invitations')
  createInvitation(
    @Param('id') teamId: string,
    @Body() createInvitationDto: CreateInvitationDto,
    @Req() req: Request & { user: { sub: string; email: string; role: string } },
  ) {
    return this.teamsService.createInvitation(teamId, createInvitationDto, req.user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Put(':id')
  updateLeader(
    @Param('id') id: string,
    @Body() updateLeaderDto: UpdateLeaderDto,
    @Req() req: Request & { user: { sub: string; email: string; role: string } },
  ) {
    return this.teamsService.updateTeamLeader(id, updateLeaderDto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Delete(':id')
  delete(
    @Param('id') id: string,
    @Req() req: Request & { user: { sub: string; email: string; role: string } },
  ) {
    return this.teamsService.deleteTeam(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(['student'])
  @Delete(':teamId/members/:userId')
  deleteMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Req() req: Request & { user: { sub: string; email: string; role: string } },
  ) {
    return this.teamsService.deleteMember(teamId, userId, req.user);
  }
}
