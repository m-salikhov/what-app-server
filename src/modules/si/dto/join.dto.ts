import { Length, IsString } from 'class-validator';

export class JoinDto {
  @IsString()
  @Length(2, 20)
  username: string;

  @IsString()
  userId: string;

  @IsString()
  roomId: string;
}
