import { Assignment } from '../src/common/interfaces/assignment.interface';

export const mockAssignments: Assignment[] = [
  {
    studentId: 1,
    projectId: 2,
    courseId: 3,
    assignedAt: new Date('2026-03-20T23:59:59'),
    createdAt: new Date('2026-03-20T23:59:59'),
    updatedAt: new Date('2026-03-20T23:59:59'),
  },
  {
    studentId: 21,
    projectId: 32,
    courseId: 1,
    assignedAt: new Date('2026-03-20T23:59:59'),
    createdAt: new Date('2026-03-20T23:59:59'),
    updatedAt: new Date('2026-03-20T23:59:59'),
  }
];
