export type {
  AutoAssignPayload,
  CreateCoursePayload,
  CreateTeamPayload,
  ManuallyAssignPayload,
  UpdateCoursePayload,
} from './payloads';

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

export interface TeamUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  groupNumber?: number;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  joinedAt: Date;
  user: TeamUser;
}

export type TeamStatus = 'forming' | 'selected' | 'assigned' | 'locked';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';

export interface Team {
  id: string;
  courseId: string;
  leaderId?: string;
  projectId?: string;
  status: TeamStatus;
  createdAt: Date;
  leader?: TeamUser;
  members: TeamMember[];
  project?: Project;
  invitations?: { id: string; inviteeId: string }[];
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  inviteeId: string;
  invitedBy: string;
  status: InvitationStatus;
  createdAt: Date;
  respondedAt?: Date;
  team: {
    id: string;
    courseId: string;
    course: { id: string; name: string };
    leader?: TeamUser;
  };
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
