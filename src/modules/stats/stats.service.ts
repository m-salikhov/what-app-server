import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { AuthenticatedRequest } from "src/Shared/Types/AuthRequest.type";
import { Repository } from "typeorm";
import { LoginStat } from "./entities/loginstat.entity";

@Injectable()
export class StatsService {
	constructor(
		@InjectRepository(LoginStat)
		private loginStatsRepo: Repository<LoginStat>,
	) {}

	async saveLoginStat(req: AuthenticatedRequest) {
		const { timestamp, ip } = this.getCommonStatsFromRequest(req);
		const username = req.user.username;
		const userID = req.user.id;

		const newLoginStat = this.loginStatsRepo.create({
			userID,
			username,
			ip,
			timestamp,
		});

		this.loginStatsRepo.save({
			...newLoginStat,
		});
	}

	private getCommonStatsFromRequest(req: Request) {
		const ip = req.ip;

		const dateNow = new Date();

		const timestamp = new Intl.DateTimeFormat("ru", {
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			timeZone: "Europe/Moscow",
		}).format(dateNow);

		return { ip, timestamp };
	}
}
