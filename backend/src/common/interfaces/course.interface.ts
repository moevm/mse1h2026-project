export interface Course {
  uid: number;
  name: string;
  maxTeamSize: number;
  minTeamSize: number;
  isActive: boolean;
  adminId: number;
  description?: string;
  registrationDeadline?: Date;
  createdAt?: Date;
}
