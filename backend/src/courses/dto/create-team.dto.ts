import { TeamStatus } from '@/generated/prisma/enums';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateTeamDto {
  @IsUUID()
  @IsOptional()
  leaderId: string;

  @IsEnum(TeamStatus)
  status: TeamStatus;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;
}
