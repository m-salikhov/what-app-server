import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class LoginUserDto {
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@Length(4, 20)
	password: string;
}
