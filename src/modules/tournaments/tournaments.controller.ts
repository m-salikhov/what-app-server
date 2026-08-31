import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { AdminGuard, OptionalAuthGuard, SelfGuard } from "../auth/guards/role.guard";
import { TournamentDto } from "./dto/tournament.dto";
import { TournamentsService } from "./tournaments.service";
import { ChangeStatusDto } from "./dto/change-status.dto";
import { UpdateTournamentDto } from "./dto/updateTournament.dto";
import { AuthenticatedRequest } from "src/Shared/Types/AuthRequest.type";
import { RandomParamsDto } from "./dto/random-param.dto";
import { PaginationParamsDto } from "./dto/pagination-params.dto";

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
	async paginate(@Query() params: PaginationParamsDto) {
		const { amount, page, withSkip } = params;
		return this.tournamentsService.paginate(amount, page, withSkip);
	}

	@Get("random/:n")
	async getRandomQuestions(@Param() params: RandomParamsDto) {
		return this.tournamentsService.getRandomQuestions(params.n);
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
	@UseGuards(OptionalAuthGuard)
	async getTournamentById(@Param("id", ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
		const role = req.user.role;
		return this.tournamentsService.getTournamentById(id, role);
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Patch("/change-status")
	async changeTournamentStatus(@Body() dto: ChangeStatusDto) {
		return this.tournamentsService.changeTournamentStatus(dto);
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Patch("/update-tournament")
	async updateTournament(@Body() dto: UpdateTournamentDto) {
		return this.tournamentsService.updateTournament(dto);
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(":id")
	async deleteTournament(@Param("id", ParseIntPipe) id: number) {
		return this.tournamentsService.deleteTournament(id);
	}
}
