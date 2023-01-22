interface ResultType {
    [key: number]: {
        num: number;
        ans: boolean;
    }[];
}
export declare class UserResultDto {
    userId: string;
    tournamentId: number;
    title: string;
    tournamentLength: number;
    resultNumber: number;
    result: ResultType;
}
export {};
