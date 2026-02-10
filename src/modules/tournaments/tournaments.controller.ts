import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseBoolPipe,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { AdminGuard, SelfGuard } from "../auth/guards/role.guard";
import { TournamentDto } from "./dto/tournament.dto";
import { TournamentsService } from "./tournaments.service";
import { ChangeStatusDto } from "./dto/change-status.dto";

@Controller("tournaments")
export class TournamentsController {
	constructor(private readonly tournamentsService: TournamentsService) {}

	@Post()
	async createTournament(@Body() tournament: TournamentDto) {
		return this.tournamentsService.createTournament(tournament);
	}

	@Post("/create-by-link")
	async parseTournamentByLink(@Body("link") link: string) {
		if (!link.includes("gotquestions.online"))
			throw new BadRequestException("Ссылка должна вести на https://www.gotquestions.online");

		return this.tournamentsService.parseTournamentByLinkGotquestions(link);
	}

	@Get("/all-short")
	async getAllTournamentsShort() {
		return this.tournamentsService.getAllTournamentsShort();
	}

	@Get("/search")
	async searchTournaments(@Query("title") title: string) {
		return this.tournamentsService.searchTournaments(title);
	}

	@UseGuards(JwtAuthGuard, SelfGuard)
	@Get("/all-by-uploader/:id")
	async getTournamentsByUploader(@Param("id") id: string) {
		return this.tournamentsService.getTournamentsByUploader(id);
	}

	@Get("/paginate")
	async paginate(
		@Query("amount", ParseIntPipe) amount: number,
		@Query("page", ParseIntPipe) page: number,
		@Query("withSkip", ParseBoolPipe) withSkip: boolean,
	) {
		return this.tournamentsService.paginate(amount, page, withSkip);
	}

	@Get("/random/:n")
	async getRandomQuestions(@Param("n", ParseIntPipe) n: number) {
		return this.tournamentsService.getRandomQuestions(n);
	}

	@Get("/random-tournament")
	async getRandomTournament(@Query("userId") userId: string) {
		return this.tournamentsService.getRandomTournament(userId);
	}

	@Get("/statistics")
	async getStatistics() {
		return this.tournamentsService.getStatistics();
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Get("/drafts")
	async getDrafts() {
		return this.tournamentsService.getDrafts();
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Get("/check-parsing")
	async checkParsing() {
		return this.tournamentsService.checkParsing();
	}

	@Get(":id")
	async getTournamentById(@Param("id", ParseIntPipe) id: number) {
		return this.tournamentsService.getTournamentById(id);
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Patch("/change-status")
	async changeTournamentStatus(@Body() dto: ChangeStatusDto) {
		return this.tournamentsService.changeTournamentStatus(dto);
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(":id")
	async deleteTournament(@Param("id", ParseIntPipe) id: number) {
		return this.tournamentsService.deleteTournament(id);
	}
}
