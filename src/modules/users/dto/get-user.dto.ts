import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class GetUserDto {
  @IsUUID()
  id?: string;
  @IsNotEmpty()
  username?: string;
  @IsEmail()
  email?: string;
}

export class updatePassDto {
  @IsUUID()
  id: string;
  @IsNotEmpty()
  newPass: string;
}
