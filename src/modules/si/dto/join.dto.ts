import { Length, IsString } from 'class-validator';

export class JoinDto {
  @IsString()
  @Length(2, 20)
  username: string;

  @IsString()
  roomId: string;
}
