import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MailService } from "../mail/mail.service";
import { parseTournamentGotquestions } from "./helpers/parse-link.helper";
import { diff } from "just-diff";
import target from "./fixtures/tournament-target.json";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tournament } from "./entities/tournament.entity";

@Injectable()
export class TournamentScheduleService {
	constructor(
		private readonly mailService: MailService,

		@InjectRepository(Tournament)
		private tournamentRepo: Repository<Tournament>,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_3AM)
	async handleCron() {
		const targetTournament = {
			...target,
			date: new Date(target.date),
		};

		const linkTarget = "https://gotquestions.online/pack/394";

		try {
			// убираем dateUpload - это всегда new Date()
			const { dateUpload, ...parsedTournament } = await parseTournamentGotquestions(linkTarget);

			const res = diff(targetTournament, parsedTournament);

			if (res.length > 0) {
				this.mailService.sendAdminEmail("Parse test failed", JSON.stringify(res));
			} else {
				this.mailService.sendAdminEmail("Parse test ok", "");
			}
		} catch (error) {
			this.mailService.sendAdminEmail("Parse test error", error.toString());
		}
	}

	// проверка использован ли пример
	// на странице https://4gk-base.andvarif.ru/addbylink
	@Cron(CronExpression.EVERY_6_HOURS)
	async checkSample() {
		const link = "https://gotquestions.online/pack/6001";

		const tournamentCheck = await this.tournamentRepo.findOne({
			where: { link },
		});

		if (tournamentCheck) {
			this.mailService.sendAdminEmail("Пример использован", `турнир ${link} был добавлен в базу`);
		}
	}
}
