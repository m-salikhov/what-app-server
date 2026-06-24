import { IsArray, IsNotEmpty, IsNumber } from "class-validator";
import { Question } from "../entities/question.entity";
import { Tournament } from "../entities/tournament.entity";

export class UpdateTournamentDto {
	@IsNumber()
	tournamentId: number;

	@IsNotEmpty()
	updateTournament: Partial<Tournament>;

	@IsArray()
	updateQuestions: Partial<Question>[];

	@IsArray()
	updateSources: { id: number; link: string }[];
}
