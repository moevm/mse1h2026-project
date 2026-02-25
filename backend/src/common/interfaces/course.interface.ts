export interface Course {
  uid: number;
  name: string;
  semester: number;
  max_team_size: number;
  min_team_size: number;
  is_active: boolean;
  registration_deadline?: Date;
}
