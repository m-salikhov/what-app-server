export declare class UserResultDto {
    userId: string;
    tournamentId: number;
    title: string;
    tournamentLength: number;
    resultNumber: number;
    result: {
        ans: boolean;
        num: number;
    }[];
}
