import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;

  @IsUUID()
  @IsNotEmpty()
  teacherId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
