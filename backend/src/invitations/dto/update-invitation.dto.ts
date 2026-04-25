import { CreateInvitationDto } from '@/teams/dto/create-invitation.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateInvitationDto extends PartialType(CreateInvitationDto) {}
