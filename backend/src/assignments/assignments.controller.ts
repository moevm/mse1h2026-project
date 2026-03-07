import { Controller, Get } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';

@Controller('api/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  findAll() {
    return this.assignmentsService.getAllAssignments();
  }
}
