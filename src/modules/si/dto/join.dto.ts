import { IsString, Length } from "class-validator";

export class JoinDto {
	@IsString()
	@Length(2, 20)
	username: string;

	@IsString()
	roomId: string;

	@IsString()
	userId: string;
}
