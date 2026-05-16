import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsUUID()
  courseId!: string;

  @IsNotEmpty()
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
