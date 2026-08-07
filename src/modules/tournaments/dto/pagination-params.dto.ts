import { Transform, Type } from "class-transformer";
import { IsInt, Min, Max, IsBoolean } from "class-validator";

export class PaginationParamsDto {
	@Type(() => Number)
	@IsInt({ message: "Параметр amount должен быть целым числом" })
	@Min(1, { message: "amount не может быть меньше 1" })
	@Max(100, { message: "amount не может быть больше 100" })
	amount: number;

	@Type(() => Number)
	@IsInt({ message: "Параметр page должен быть целым числом" })
	@Min(1, { message: "page не может быть меньше 1" })
	page: number;

	@Transform(({ value }) => {
		if (value === "true") return true;
		if (value === "false") return false;
		return value;
	})
	@IsBoolean({ message: "Параметр withSkip должен быть boolean" })
	withSkip: boolean;
}
