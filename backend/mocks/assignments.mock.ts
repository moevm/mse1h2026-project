import { Assignment } from '../src/common/interfaces/assignment.interface';

export const mockAssignments: Assignment[] = [
  {
    studentId: 1,
    studentFirstName: "Иван",
    studentLastName: "Иванов",
    projectName: "Платформа для распределения проектов",
    courseName: "MSE",
    projectId: 201,
    courseId: 3,
    assignedAt: new Date('2026-03-20T23:59:59'),
    createdAt: new Date('2026-03-20T23:59:59'),
    updatedAt: new Date('2026-03-20T23:59:59'),
  },
  {
    studentId: 2,
    studentFirstName: "Мария",
    studentLastName: "Мариева",
    projectName: "Проектирование базы данных для интернет-магазина ателье",
    courseName: "noSQL",
    projectId: 202,
    courseId: 1,
    assignedAt: new Date('2026-03-20T23:59:59'),
    createdAt: new Date('2026-03-20T23:59:59'),
    updatedAt: new Date('2026-03-20T23:59:59'),
  },
];
