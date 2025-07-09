import { IsNotEmpty, IsUUID, Length } from 'class-validator';

export class updatePassDto {
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @Length(4, 20)
  newPass: string;
}
