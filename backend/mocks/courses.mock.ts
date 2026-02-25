import { Course } from '../src/common/interfaces/course.interface';

export const mockCourses: Course[] = [
  {
    uid: 101,
    name: 'MSE',
    semester: 6,
    max_team_size: 5,
    min_team_size: 5,
    is_active: true,
    registration_deadline: new Date('2026-03-15T23:59:59'),
  },
  {
    uid: 102,
    name: 'NoSQL',
    semester: 6,
    max_team_size: 3,
    min_team_size: 2,
    is_active: true,
    registration_deadline: new Date('2026-03-20T23:59:59'),
  },
];
