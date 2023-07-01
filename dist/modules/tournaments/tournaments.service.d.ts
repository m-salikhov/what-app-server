import { Repository } from 'typeorm';
import { QuestionDto } from './dto/question.dto';
import { TournamentDto } from './dto/tournament.dto';
import { Editor } from './entities/editors.entity';
import { Question } from './entities/question.entity';
import { Source } from './entities/sourse.entity';
import { Tournament } from './entities/tournament.entity';
export declare class TournamentsService {
    private tournamentRepo;
    private editorRepo;
    private questionRepo;
    private sourceRepo;
    constructor(tournamentRepo: Repository<Tournament>, editorRepo: Repository<Editor>, questionRepo: Repository<Question>, sourceRepo: Repository<Source>);
    createTournamet(tournament: TournamentDto): Promise<number>;
    parseTournamentByLink(link: string): Promise<Omit<TournamentDto, "uploaderUuid" | "uploader">>;
    getTournamentById(id: number): Promise<TournamentDto | "Tournament not found">;
    getRandomQuestions(n: number): Promise<QuestionDto[]>;
    getRandomTournaments(n: number): Promise<string[]>;
    getLastAddTournaments(n: number): Promise<number | Tournament[]>;
    getAllTournamentsShort(): Promise<Tournament[]>;
    getTournamentsByUploader(uploaderId: string): Promise<Tournament[]>;
    private normalizeQuestions;
    private normalizeEditors;
    private normalizeTournament;
}
