import { IsNotEmpty, IsUUID, Length } from 'class-validator';

export class UpdatePassDto {
  @IsNotEmpty()
  @Length(4, 20)
  newPass: string;
}
