import { AssignmentStatus } from '@/generated/prisma/enums';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ManuallyAssignDto {
  @IsNotEmpty()
  @IsUUID()
  courseId!: string;

  @IsNotEmpty()
  @IsUUID()
  projectId!: string;

  @IsNotEmpty()
  @IsUUID()
  teamId!: string;

  @IsEnum(AssignmentStatus)
  @IsNotEmpty()
  status!: AssignmentStatus;

  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  approvedAt?: Date;
}
