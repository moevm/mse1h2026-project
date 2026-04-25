import { IsUUID } from 'class-validator';

export class CreateInvitationDto {
  @IsUUID()
  inviteeId: string;
}
