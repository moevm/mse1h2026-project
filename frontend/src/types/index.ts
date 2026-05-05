export interface Course {
  id: string;
  name: string;
  maxTeamSize: number;
  minTeamSize: number;
  isActive: boolean;
  teacherId: string;
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
  teacher: User;
  course: Course;
  courseId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: string;
  firstName: string;
  secondName: string;
  role: 'student' | 'admin';
  email: string;
  ldapUid: string;
  groupNumber: number;
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
