import { Injectable } from '@nestjs/common';
import { mockAssignments } from '../../mocks/assignments.mock';

@Injectable()
export class AssignmentsService {
  getAllAssignments() {
    return mockAssignments;
  }
}
