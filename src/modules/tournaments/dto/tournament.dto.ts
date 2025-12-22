import { Type } from "class-transformer";
import {
	IsArray,
	IsDate,
	IsDateString,
	IsIn,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsString,
	IsUrl,
	IsUUID,
	ValidateIf,
	ValidateNested,
} from "class-validator";
import { QuestionDto } from "./question.dto";

export class EditorDto {
	@IsString()
	name: string;
}

export class TournamentDto {
	@IsString()
	@IsNotEmpty()
	title: string;

	@IsDateString()
	date: string;

	@IsInt()
	questionsQuantity: number;

	@IsInt()
	tours: number;

	@IsNumber()
	difficulty: number;

	@IsDateString()
	dateUpload: string;

	@IsString()
	@ValidateIf((tournament: TournamentDto) => tournament.uploaderUuid !== "")
	@IsUUID()
	uploaderUuid: string;

	@IsString()
	uploader: string;

	@IsIn(["published", "draft"])
	status: "published" | "draft";

	@IsUrl()
	link: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => EditorDto)
	editors: EditorDto[];

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => QuestionDto)
	questions: QuestionDto[];
}
