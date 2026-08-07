import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";

type AttemptsState = {
	attempts: number;
	blocked: boolean;
};

@Injectable()
export class LoginAttemptsService {
	private readonly maxAttempts = 5;
	private readonly attemptsTtl = 60 * 1000;

	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

	async isBlocked(email: string) {
		const attemptsState = await this.cacheManager.get<AttemptsState>(`block:${email}`);

		return attemptsState ? attemptsState.blocked : false;
	}

	// Запись неудачной попытки
	async recordFailedAttempt(email: string) {
		const key = `block:${email}`;

		const attemptsState = await this.cacheManager.get<AttemptsState>(key);

		if (attemptsState === undefined) {
			await this.cacheManager.set<AttemptsState>(
				key,
				{ attempts: 1, blocked: false },
				this.attemptsTtl,
			);

			return;
		}

		if (attemptsState.blocked) return;

		if (attemptsState.attempts < this.maxAttempts) {
			const attempts = attemptsState.attempts + 1;

			await this.cacheManager.set<AttemptsState>(
				key,
				{ blocked: attempts === this.maxAttempts, attempts },
				this.attemptsTtl,
			);
		}
	}

	async resetAttempts(email: string): Promise<void> {
		await this.cacheManager.del(`block:${email}`);
	}
}
