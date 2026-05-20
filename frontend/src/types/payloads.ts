export interface CreateTeamPayload {
  courseId: string;
  projectId?: string;
}

type AssignmentStatus = 'active' | 'pending_change' | 'replaced';

export interface CreateCoursePayload {
  name: string;
  maxTeamSize: number;
  minTeamSize: number;
  isActive?: boolean;
  registrationDeadline?: Date;
  teacherId?: string;
}

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export interface AutoAssignPayload {
  courseId: string;
}

export interface ManuallyAssignPayload {
  courseId: string;
  projectId: string;
  teamId: string;
  status: AssignmentStatus;
  approvedBy?: string;
  approvedAt?: Date;
}