import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsUUID()
  courseId!: string;

  @IsNotEmpty()
  @IsUUID()
  projectId?: string;
}
