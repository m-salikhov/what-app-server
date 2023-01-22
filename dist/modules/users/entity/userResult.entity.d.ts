export declare class UserResult {
    id: string;
    userId: string;
    date: number;
    tournamentId: number;
    title: string;
    tournamentLength: number;
    resultNumber: number;
    result: ResultElem[];
}
export declare class ResultElem {
    id: number;
    ans: boolean;
    num: number;
    tour: number;
    userResult: UserResult;
}
