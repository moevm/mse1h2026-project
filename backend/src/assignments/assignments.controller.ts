import { Controller, Get, Query } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  findAll(@Query() query: unknown) {
    return this.assignmentsService.getAllAssignments();
  }
}
