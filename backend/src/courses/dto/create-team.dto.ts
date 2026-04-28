import { TeamStatus } from '@/generated/prisma/enums';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateTeamDto {
  @IsOptional()
  @IsUUID()
  leaderId?: string;

  @IsEnum(TeamStatus)
  @IsNotEmpty()
  status!: TeamStatus;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  createdAt!: Date;
}
