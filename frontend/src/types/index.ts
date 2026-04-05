export interface Course {
  id: string;
  name: string;
  maxTeamSize: number;
  minTeamSize: number;
  isActive: boolean;
  adminId?: string;
  description?: string;
  registrationDeadline?: Date;
  createdAt?: Date;
}

export interface FormData {
  name: string;
  semester: number;
  teacherId: string;
  minTeamSize: number;
  maxTeamSize: number;
  registrationDeadline: number | null;
  isActive: boolean;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  teacherId: string;
  teacherFirstName: string;
  teacherLastName: string;
  courseName: string;
  courseId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  group?: number;
  role: 'student' | 'admin';
  email: string;
  ldapUid: number;
}

export interface UserAuth {
  userId: number;
  email: string;
  password: string;
  role: 'student' | 'admin';
}

export interface Assignment {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  projectId: string;
  projectName: string;
  courseId: string;
  courseName: string;
  assignedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
