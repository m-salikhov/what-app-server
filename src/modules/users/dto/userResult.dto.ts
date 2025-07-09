import {
  IsUUID,
  IsInt,
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

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
