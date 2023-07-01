import { TournamentDto } from './dto/tournament.dto';
import { TournamentsService } from './tournaments.service';
export declare class TournamentsController {
    private readonly tournamentsService;
    constructor(tournamentsService: TournamentsService);
    createTournament(tournament: TournamentDto): Promise<number>;
    parseTournamentByLink(link: string): Promise<Omit<TournamentDto, "uploaderUuid" | "uploader">>;
    getAllTournamentsShort(): Promise<import("./entities/tournament.entity").Tournament[]>;
    getTournamentsByUploader(uuid: string): Promise<import("./entities/tournament.entity").Tournament[]>;
    getLastTen(n: number): Promise<number | import("./entities/tournament.entity").Tournament[]>;
    getRandomQuestions(n: number): Promise<import("./dto/question.dto").QuestionDto[]>;
    getTournamentById(id: number): Promise<TournamentDto | "Tournament not found">;
    getRandomTournaments(n: number): Promise<string[]>;
}
