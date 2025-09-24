import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailService {
	constructor(private readonly mailerService: MailerService) {}

	async sendUserRegistration(email: string, username: string) {
		await this.mailerService.sendMail({
			to: email,
			subject: "Добро пожаловать!",
			template: "welcome",
			context: { username },
		});
	}

	async sendTournamentNotification(email: string, tournamentName: string) {
		await this.mailerService.sendMail({
			to: email,
			subject: "Новый турнир создан!",
			template: "tournament-created",
			context: { tournamentName },
		});
	}

	async sendAdminEmail(subject: string, text: string) {
		try {
			await this.mailerService.sendMail({
				to: process.env.ANDVARY_INBOX,
				subject,
				text,
			});
		} catch (error) {
			console.log(error);
		}
	}
}
