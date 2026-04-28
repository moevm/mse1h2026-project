import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateLeaderDto {
  @IsNotEmpty()
  @IsUUID()
  leaderId!: string;
}
