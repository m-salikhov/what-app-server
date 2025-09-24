import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class CreateUserDto {
	@IsNotEmpty()
	@Length(2, 20)
	username: string;

	@IsEmail()
	email: string;

	@IsNotEmpty()
	@Length(4, 20)
	password: string;
}
