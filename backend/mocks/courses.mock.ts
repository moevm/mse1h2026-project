import { Course } from '../src/common/interfaces/course.interface';

export const mockCourses: Course[] = [
  {
    uid: 101,
    name: 'MSE',
    semester: 6,
    maxTeamSize: 5,
    minTeamSize: 5,
    isActive: true,
    registrationDeadline: new Date('2026-03-15T23:59:59'),
  },
  {
    uid: 102,
    name: 'NoSQL',
    semester: 6,
    maxTeamSize: 3,
    minTeamSize: 2,
    isActive: true,
    registrationDeadline: new Date('2026-03-20T23:59:59'),
  },
];
