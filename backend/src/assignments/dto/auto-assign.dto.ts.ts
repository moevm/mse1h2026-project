import { IsNotEmpty, IsUUID } from 'class-validator';

export class AutoAssignDto {
  @IsNotEmpty()
  @IsUUID()
  courseId!: string;
}
