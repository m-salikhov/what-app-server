import { IsUUID, IsNotEmpty } from 'class-validator';

interface ResultType {
  [tourNumber: number]: { num: number; ans: boolean }[];
}

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
  result: ResultType;
}
