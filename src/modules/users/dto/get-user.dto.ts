import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class GetUserDto {
  id?: string;
  username?: string;
  email?: string;
}

export class updatePassDto {
  @IsUUID()
  id: string;
  @IsNotEmpty()
  newPass: string;
}
