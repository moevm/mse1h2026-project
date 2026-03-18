import { mockAssignments } from '@/mocks/assignments.mock';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AssignmentsService {
  getAllAssignments() {
    return mockAssignments;
  }
}
