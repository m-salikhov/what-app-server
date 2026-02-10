import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MailService } from "../mail/mail.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tournament } from "./entities/tournament.entity";
import { TournamentsService } from "./tournaments.service";

@Injectable()
export class TournamentScheduleService {
	constructor(
		private readonly mailService: MailService,
		private readonly tournamentsService: TournamentsService,

		@InjectRepository(Tournament)
		private tournamentRepo: Repository<Tournament>,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_3AM)
	async checkParsing() {
		try {
			const res = await this.tournamentsService.checkParsing();

			if (res !== "success") {
				this.mailService.sendAdminEmail("Parse test: failed", JSON.stringify(res));
			} else {
				this.mailService.sendAdminEmail("Parse test: success", "");
			}
		} catch (error) {
			this.mailService.sendAdminEmail("Parse test: error", error.toString());
		}
	}

	// проверка использован ли пример
	// на странице https://4gk-base.andvarif.ru/addbylink
	@Cron(CronExpression.EVERY_6_HOURS)
	async checkSample() {
		const link = "https://gotquestions.online/pack/6001";

		const tournamentCheck = await this.tournamentRepo.exists({
			where: { link },
		});

		if (tournamentCheck) {
			this.mailService.sendAdminEmail("Пример использован", `турнир ${link} был добавлен в базу`);
		}
	}
}
