import {
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
  IsUrl,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SourceDto {
  @IsString()
  link: string;
}

export class QuestionDto {
  @IsIn(['regular', 'double', 'triple', 'other', 'outside'])
  type: 'regular' | 'double' | 'triple' | 'other' | 'outside';

  @IsInt()
  qNumber: number;

  @IsInt()
  tourNumber: number;

  @IsOptional()
  @IsString()
  add?: string;

  @IsString()
  text: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsString()
  alterAnswer?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsString()
  author: string;

  @ValidateNested({ each: true })
  @Type(() => SourceDto)
  @ArrayMinSize(1)
  source: SourceDto[];
}
