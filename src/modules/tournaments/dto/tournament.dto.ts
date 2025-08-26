import {
  IsNotEmpty,
  IsArray,
  IsUUID,
  ValidateNested,
  IsString,
  IsInt,
  IsUrl,
  ValidateIf,
  IsNumber,
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

  @IsNumber()
  difficulty: number;

  @IsNotEmpty()
  dateUpload: number;

  @IsString()
  @ValidateIf((tournament: TournamentDto) => tournament.uploaderUuid !== '')
  @IsUUID()
  uploaderUuid: string;

  @IsString()
  uploader: string;

  @IsString()
  status: 'published' | 'draft' | 'moderation';

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
