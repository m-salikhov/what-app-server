import { Type } from "class-transformer";
import { ArrayMinSize, IsIn, IsInt, IsOptional, IsString, ValidateNested } from "class-validator";

export class SourceDto {
	@IsString()
	link: string;
}

export class AddMetadataDto {
	@IsInt()
	@IsOptional()
	id?: number;

	@IsString()
	type: string;

	@IsInt()
	width: number;

	@IsInt()
	height: number;
}

export class QuestionDto {
	@IsIn(["regular", "double", "triple", "other", "outside"])
	type: "regular" | "double" | "triple" | "other" | "outside";

	@IsInt()
	qNumber: number;

	@IsInt()
	tourNumber: number;

	@IsString()
	add: string;

	@IsString()
	text: string;

	@IsString()
	answer: string;

	@IsString()
	alterAnswer: string;

	@IsString()
	comment: string;

	@IsString()
	author: string;

	@IsString()
	answerRatio: string;

	@ValidateNested({ each: true })
	@Type(() => SourceDto)
	@ArrayMinSize(1)
	source: SourceDto[];

	@ValidateNested()
	@Type(() => AddMetadataDto)
	@IsOptional()
	addMetadata?: AddMetadataDto | null;
}
