import { PartialType } from '@nestjs/mapped-types';

import { CreateInvitationDto } from '@/teams/dto/create-invitation.dto';

export class UpdateInvitationDto extends PartialType(CreateInvitationDto) {}
