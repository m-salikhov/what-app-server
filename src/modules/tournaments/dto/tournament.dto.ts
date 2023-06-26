import { IsNotEmpty, IsArray, IsUUID } from 'class-validator';
import { QuestionDto } from './question.dto';

export class TournamentDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  date: number;
  @IsNotEmpty()
  questionsQuantity: number;
  @IsNotEmpty()
  tours: number;
  @IsArray()
  questions: QuestionDto[];
  @IsArray()
  editors: string[];
  @IsNotEmpty()
  dateUpload: number;
  @IsUUID()
  uploaderUuid: string;
  @IsNotEmpty()
  uploader: string;
}

export class getTournametDto {
  title?: string;
  date?: number;
  editor?: string;
  maxDateUpload?: number;
  minDateUploader?: number;
}
