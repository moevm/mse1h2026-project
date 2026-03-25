export interface Course {
  uid: number;
  name: string;
  maxTeamSize: number;
  minTeamSize: number;
  isActive: boolean;
  adminId?: number;
  description?: string;
  registrationDeadline?: Date;
  createdAt?: Date;
}

export interface FormData {
  name: string;
  semester: number;
  teacherId: number;
  minTeamSize: number;
  maxTeamSize: number;
  registrationDeadline: number | null;
  isActive: boolean;
}

export interface Project {
  uid: number;
  title: string;
  description?: string;
  teacherId: number;
  teacherFirstName: string;
  teacherLastName: string;
  courseName: string;
  courseId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  uid: number;
  firstName: string;
  secondName: string;
  group?: number;
  role: 'student' | 'admin';
  email: string;
  ldapUid: number;
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
