import { IsNotEmpty, IsEmail, Length, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(2, 20)
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(4, 20)
  password: string;

  @IsNotEmpty()
  role: 'user' | 'superuser' | 'admin';
}
