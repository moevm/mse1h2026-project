import { RequestStatus } from '@/generated/prisma/enums';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsUUID()
  courseId!: string;

  @IsNotEmpty()
  @IsUUID()
  initiatorTeamId!: string;

  @IsNotEmpty()
  @IsUUID()
  targetTeamId!: string;

  @IsNotEmpty()
  @IsUUID()
  initiatorProjectId!: string;

  @IsNotEmpty()
  @IsUUID()
  targetProjectId!: string;

  @IsEnum(RequestStatus)
  @IsNotEmpty()
  status!: RequestStatus;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  approvedAt?: Date;
}
