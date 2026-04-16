import { Type } from 'class-transformer';
import { InvitationStatus } from '@/generated/prisma/enums';
import { IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateInvitationDto {
  @IsUUID()
  teamId: string;

  @IsUUID()
  inviteeId: string;
  
  @IsUUID()
  invitedBy: string;
  
  @IsEnum(InvitationStatus)
  status: InvitationStatus;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;
  
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  respondedAt?: Date
}