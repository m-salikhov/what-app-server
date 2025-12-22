import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { guestAccount } from "src/Shared/constants/user.constants";
import { FindOptionsWhere, In, Not, Repository } from "typeorm";
import { MailService } from "../mail/mail.service";
import { UsersService } from "../users/users.service";
import { TournamentDto } from "./dto/tournament.dto";
import { Editor } from "./entities/editors.entity";
import { Question } from "./entities/question.entity";
import { Source } from "./entities/source.entity";
import { Tournament } from "./entities/tournament.entity";
import { parseTournamentGotquestions } from "./helpers/parse-link.helper";
import { ChangeStatusDto } from "./dto/change-status.dto";

@Injectable()
export class TournamentsService {
	constructor(
		@InjectRepository(Tournament)
		private tournamentRepo: Repository<Tournament>,
		@InjectRepository(Editor)
		private editorRepo: Repository<Editor>,
		@InjectRepository(Question)
		private questionRepo: Repository<Question>,
		@InjectRepository(Source)
		private sourceRepo: Repository<Source>,
		private usersService: UsersService,
		private readonly mailService: MailService,
	) {}

	async createTournament(tournament: TournamentDto) {
		const tournamentCheck = await this.tournamentRepo.findOne({
			where: { link: tournament.link },
		});
		if (tournamentCheck) throw new ConflictException("Турнир уже существует в системе");
		const savedEditors = await Promise.all(
			tournament.editors.map(async (editor) => {
				const existingEditor = await this.editorRepo.findOne({
					where: { name: editor.name },
				});

				if (existingEditor) return existingEditor;

				return this.editorRepo.save(editor);
			}),
		);
		const savedQuestions = [];
		for (const question of tournament.questions) {
			const savedSources = [];
			for (const source of question.source) {
				const savedSource = await this.sourceRepo.save(source);
				savedSources.push(savedSource);
			}

			const savedQuestion = await this.questionRepo.save({
				...question,
				source: savedSources,
			});

			savedQuestions.push(savedQuestion);
		}

		const newTournament = this.tournamentRepo.create({
			...tournament,
			dateUpload: new Date(),
			editors: savedEditors,
			questions: savedQuestions,
			uploader: tournament.uploader || guestAccount.username,
			uploaderUuid: tournament.uploaderUuid || guestAccount.id,
		});

		const savedTournament = await this.tournamentRepo.save(newTournament);

		this.mailService.sendAdminEmail(
			"Новый турнир",
			`Название: ${savedTournament.title},
      пользователь: ${savedTournament.uploader} 
      источник: ${savedTournament.link}
      ссылка: https://4gk-base.andvarif.ru/tournament/${savedTournament.id}`,
		);
		return savedTournament.id;
	}

	async parseTournamentByLinkGotquestions(link: string) {
		const tournamentCheck = await this.tournamentRepo.findOne({
			where: { link },
		});

		if (tournamentCheck) throw new ConflictException("Турнир уже существует в системе");

		try {
			const tournament = await parseTournamentGotquestions(link);
			return tournament;
		} catch (_error) {
			throw new BadRequestException("Не удаётся распарсить турнир, проверьте ссылку");
		}
	}

	async getTournamentById(id: number) {
		const tournament = await this.tournamentRepo.findOne({
			where: { id },
			relations: ["editors", "questions"],
		});

		if (!tournament) {
			throw new NotFoundException("Турнир не найден");
		}

		return tournament;
	}

	async getRandomTournament(userId: string) {
		// получаем id турниров, которые пользователь сыграл
		const results = userId ? await this.usersService.getUserResultShort(userId) : [];

		const forbiddenIds = results.length > 0 ? results.map((v) => v.tournamentId) : [];

		const whereClause: FindOptionsWhere<Tournament> = {};
		// исключаем турниры, которые добавил пользователь
		if (userId) {
			whereClause.uploaderUuid = Not(userId);
		}
		// исключаем турниры, которые пользователь сыграл
		if (forbiddenIds.length > 0) {
			whereClause.id = Not(In(forbiddenIds));
		}

		const tournament = await this.tournamentRepo
			.createQueryBuilder("tournament")
			.where(whereClause)
			.orderBy("RAND()")
			.limit(1)
			.getOne();

		if (!tournament) {
			throw new NotFoundException("Турниры закончились");
		}

		return tournament;
	}

	async getRandomQuestions(n: number) {
		const questionIdsResult: { id: number }[] = await this.questionRepo
			.createQueryBuilder("question")
			.select("question.id", "id")
			.orderBy("RAND()")
			.limit(n)
			.getRawMany();

		const questionIds = questionIdsResult.map((item) => item.id);

		if (questionIds.length === 0) {
			return [];
		}
		const randomQuestions = await this.questionRepo.find({
			where: { id: In(questionIds) },
			relations: ["tournament", "source"],
		});

		return randomQuestions;
	}

	async getLastAddTournaments(amount: number, page: number, withSkip: boolean) {
		const repo = this.tournamentRepo;
		const skip = (page - 1) * amount;

		const tournaments = await repo.find({
			order: { dateUpload: "DESC" },
			skip: withSkip ? skip : 0,
			take: withSkip ? amount : amount * page,
		});

		const count = await repo.count();

		const pageCount = Math.ceil(count / amount);

		const hasMorePage = page < pageCount;

		return { tournaments, count, pageCount, hasMorePage };
	}

	async getAllTournamentsShort() {
		const tournaments = await this.tournamentRepo.find({
			order: { dateUpload: "DESC" },
		});

		return tournaments;
	}

	async getTournamentsByUploader(uploaderId: string) {
		const tournaments = await this.tournamentRepo.find({
			where: { uploaderUuid: uploaderId },
			order: { dateUpload: "DESC" },
		});

		return tournaments;
	}

	async getStatistics() {
		const tc = await this.tournamentRepo.count();
		const qc = await this.questionRepo.count();

		return { tc, qc };
	}

	async getDrafts() {
		return await this.tournamentRepo.find({
			where: { status: "draft" },
			relations: ["editors", "questions"],
		});
	}

	async deleteTournament(id: number) {
		const tournament = await this.tournamentRepo.findOne({ where: { id } });
		if (!tournament) {
			throw new NotFoundException(`Турнир с id ${id} не найден`);
		}

		await this.tournamentRepo.remove(tournament);
	}

	async changeTournamentStatus({ id, status }: ChangeStatusDto) {
		const isExists = await this.tournamentRepo.exists({ where: { id } });
		if (!isExists) {
			throw new NotFoundException(`Турнир с id ${id} не найден`);
		}

		await this.tournamentRepo.update({ id }, { status });

		return { id, status };
	}
}
