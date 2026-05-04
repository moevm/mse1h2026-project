import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsUUID()
  courseId: string;

  @IsUUID()
  teacherId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
