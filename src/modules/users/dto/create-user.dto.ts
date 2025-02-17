import { IsNotEmpty, IsEmail, Length, IsNumber } from 'class-validator';

export class CreateUserDto {
  @Length(2, 20)
  username: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  role: 'user' | 'superuser' | 'admin';
  @IsNumber()
  date: number;
}
