import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsString,
	IsUUID,
	Min,
	ValidateNested,
} from "class-validator";

class ResultItemDto {
	@IsInt()
	@Min(1)
	num: number;

	@IsBoolean()
	ans: boolean;

	@IsInt()
	@Min(1)
	tour: number;
}

export class UserResultDto {
	@IsUUID()
	userId: string;

	@IsInt()
	@Min(1)
	tournamentId: number;

	@IsString()
	@IsNotEmpty()
	title: string;

	@IsInt()
	@Min(1)
	tournamentLength: number;

	@IsInt()
	@Min(0)
	resultNumber: number;

	@IsArray()
	@IsNotEmpty()
	@ValidateNested({ each: true })
	@Type(() => ResultItemDto)
	result: ResultItemDto[];
}
