import { IsString, IsInt, IsBoolean, IsOptional, IsUUID, Min, IsDate, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsInt()
  @Min(1)
  semester: number;

  @IsInt()
  @Min(1)
  maxTeamSize: number;

  @IsInt()
  @Min(1)
  minTeamSize: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  registrationDeadline?: Date;

  @IsUUID()
  teacherId: string;
}
