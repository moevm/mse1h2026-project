import { Course } from '@/common/interfaces/course.interface';

export const mockCourses: Course[] = [
  {
    uid: 101,
    name: 'MSE',
    semester: 6,
    maxTeamSize: 5,
    minTeamSize: 5,
    isActive: false,
    adminId: 3,
    registrationDeadline: new Date('2026-03-15T23:59:59'),
    createdAt: new Date('2026-03-15T23:59:59'),
  },
  {
    uid: 102,
    name: 'NoSQL',
    semester: 6,
    maxTeamSize: 3,
    minTeamSize: 2,
    isActive: true,
    adminId: 4,
    registrationDeadline: new Date('2026-03-20T23:59:59'),
    createdAt: new Date('2026-03-20T23:59:59'),
  },
];
