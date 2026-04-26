import { InvitationStatus } from '@/generated/prisma/enums';
import { IsEnum } from 'class-validator';

export class UpdateInvitationDto {
  @IsEnum(InvitationStatus)
  status: InvitationStatus;
}
