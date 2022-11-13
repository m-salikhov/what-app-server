import { TournamentDto } from './dto/tournament.dto';
import { TournamentsService } from './tournaments.service';
export declare class TournamentsController {
    private readonly tournamentsService;
    constructor(tournamentsService: TournamentsService);
    createTournament(tournament: TournamentDto): Promise<number>;
    getAllTournamentsShort(): Promise<import("./entities/tournament.entity").Tournament[]>;
    getTournamentsByUploader(id: string): Promise<import("./entities/tournament.entity").Tournament[]>;
    getLastTen(n: string): Promise<number | import("./entities/tournament.entity").Tournament[]>;
    getRandomQuestions(n: string): Promise<import("./dto/question.dto").QuestionDto[]>;
    getTournamentById(id: string): Promise<TournamentDto | "Tournament not found">;
    getRandomTournaments(n: string): Promise<string[]>;
}
