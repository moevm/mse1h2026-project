import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateRequestDto {
  @IsNotEmpty()
  @IsIn(['confirm', 'reject'])
  action!: 'confirm' | 'reject';
}
