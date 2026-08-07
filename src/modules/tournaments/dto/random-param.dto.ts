import { Type } from "class-transformer";
import { IsInt, Min, Max } from "class-validator";

export class RandomParamsDto {
	@Type(() => Number)
	@IsInt({ message: "Параметр n должен быть целым числом" })
	@Min(1, { message: "n не может быть меньше 1" })
	@Max(36, { message: "n не может быть больше 36" })
	n: number;
}
