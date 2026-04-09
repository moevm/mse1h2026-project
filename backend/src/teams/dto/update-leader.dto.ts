import { IsUUID } from 'class-validator';

export class UpdateLeaderDto {
  @IsUUID()
  leaderId: string;
}