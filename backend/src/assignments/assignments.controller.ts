import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';

import { AssignmentsService } from './assignments.service';

@Controller('api/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @UseGuards(RolesGuard)
  @Roles(['student', 'admin'])
  @Get()
  findAll() {
    return this.assignmentsService.getAllAssignments();
  }

  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.assignmentsService.deleteAssignment(id);
  }
}
