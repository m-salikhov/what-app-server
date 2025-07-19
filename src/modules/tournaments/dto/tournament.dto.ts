import {
  IsNotEmpty,
  IsArray,
  IsUUID,
  ValidateNested,
  IsString,
  IsInt,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { QuestionDto } from './question.dto';
import { Type } from 'class-transformer';

export class EditorDto {
  @IsString()
  name: string;
}

export class TournamentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  date: number;

  @IsInt()
  questionsQuantity: number;

  @IsInt()
  tours: number;

  @IsNotEmpty()
  dateUpload: number;

  @IsString()
  @ValidateIf((tournament: TournamentDto) => tournament.uploaderUuid !== '')
  @IsUUID()
  uploaderUuid: string;

  @IsString()
  uploader: string;

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
