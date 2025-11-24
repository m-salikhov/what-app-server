import { IsIn, IsInt } from "class-validator";

export class ChangeStatusDto {
	@IsIn(["published", "draft"])
	status: "published" | "draft";

	@IsInt()
	id: number;
}
