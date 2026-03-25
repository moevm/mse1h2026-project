import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MaxLength(255)
  name: string;

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

  @IsOptional()
  @IsUUID()
  teacherId: string;
}
