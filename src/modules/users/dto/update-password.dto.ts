import { IsNotEmpty, IsUUID, Length } from "class-validator";

export class UpdatePassDto {
	@IsUUID()
	id: string;

	@IsNotEmpty()
	@Length(4, 20)
	newPass: string;
}
