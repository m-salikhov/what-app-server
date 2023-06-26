import { IsNotEmpty, IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @Length(2, 20)
  username: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  role: 'user' | 'superuser' | 'admin';
  date: number;
}
