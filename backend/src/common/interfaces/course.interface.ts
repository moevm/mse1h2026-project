export interface Course {
  uid: number;
  name: string;
  semester: number;
  maxTeamSize: number;
  minTeamSize: number;
  isActive: boolean;
  registrationDeadline?: Date;
}
