import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsUUID()
  courseId!: string;

  @IsNotEmpty()
  @IsUUID()
  initiatorTeamId!: string;

  @IsNotEmpty()
  @IsUUID()
  targetTeamId!: string;

  @IsNotEmpty()
  @IsUUID()
  initiatorProjectId!: string;

  @IsNotEmpty()
  @IsUUID()
  targetProjectId!: string;
}
