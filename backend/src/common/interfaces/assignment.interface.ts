export interface Assignment {
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  projectId: number;
  projectName: string;
  courseId: number;
  courseName: string;
  assignedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
