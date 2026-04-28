import { InvitationStatus } from '@/generated/prisma/enums';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateInvitationDto {
  @IsEnum(InvitationStatus)
  @IsNotEmpty()
  status!: InvitationStatus;
}
