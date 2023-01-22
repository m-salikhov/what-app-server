interface ResultType {
  [key: number]: { num: number; ans: boolean }[];
}

export class UserResultDto {
  userId: string;
  tournamentId: number;
  title: string;
  tournamentLength: number;
  resultNumber: number;
  result: ResultType;
}
