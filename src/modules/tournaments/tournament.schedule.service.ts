import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MailService } from "../mail/mail.service";
import { parseTournamentGotquestions } from "./helpers/parse-link.helper";
import { diff } from "just-diff";
import target from "./fixtures/tournament-target.json";

@Injectable()
export class TournamentScheduleService {
	constructor(private readonly mailService: MailService) {}

	@Cron(CronExpression.EVERY_DAY_AT_3AM)
	async handleCron() {
		const targetTournament = {
			...target,
			date: new Date(target.date),
		};

		try {
			// убираем dateUpload так как это всегда new Date()
			const { dateUpload, ...parsedTournament } = await parseTournamentGotquestions(
				"https://gotquestions.online/pack/394",
			);

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
}
