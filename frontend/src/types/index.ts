export interface Course {
  uid: number;
  name: string;
  semester: number;
  maxTeamSize: number;
  minTeamSize: number;
  isActive: boolean;
  registrationDeadline?: Date;
}

export interface Project {
  uid: number;
  title: string;
  description?: string;
  teacherId: number;
  teacherFirstName: string,
  teacherLastName: string,
  courseName: string,
  courseId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

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