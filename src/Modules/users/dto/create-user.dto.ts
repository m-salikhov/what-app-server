export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'superuser' | 'admin';
  date: number;
}
