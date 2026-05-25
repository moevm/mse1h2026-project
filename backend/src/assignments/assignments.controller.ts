import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserPayload } from '@/common/interfaces/user.interface';
import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';

import { AssignmentsService } from './assignments.service';
import { AutoAssignDto } from './dto/auto-assign.dto';
import { ManuallyAssignDto } from './dto/manually-assign.dto';

@Controller('api/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Get()
  findAll(@Query('courseId') courseId: string) {
    return this.assignmentsService.getCourseAssignments(courseId);
  }

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Post('manual')
  assignTeamManually(@Body() assignTeamDto: ManuallyAssignDto, @Req() req: Request & UserPayload) {
    return this.assignmentsService.assignTeamManually(assignTeamDto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Post('auto')
  async assignTeamAutomatically(@Body() autoAssignDto: AutoAssignDto) {
    const ids = await this.assignmentsService.assignTeamAutomatically(autoAssignDto.courseId);
    return { message: 'Teams assigned to projects successfully.', assignedTeamIds: ids };
  }

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.assignmentsService.deleteAssignment(id);
  }
}
