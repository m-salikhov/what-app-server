import { IsUUID, IsNotEmpty, IsArray } from 'class-validator';

type ResultType = { num: number; ans: boolean; tour: number }[];
export class UserResultDto {
  @IsUUID()
  userId: string;
  @IsNotEmpty()
  tournamentId: number;
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  tournamentLength: number;
  @IsNotEmpty()
  resultNumber: number;
  @IsArray()
  result: ResultType;
}
