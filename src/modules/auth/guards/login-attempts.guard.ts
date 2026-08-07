import { CanActivate, ExecutionContext, Injectable, HttpException } from "@nestjs/common";
import { LoginAttemptsService } from "../login-attempts.service";

@Injectable()
export class LoginAttemptsGuard implements CanActivate {
	constructor(private loinAttemptsService: LoginAttemptsService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const { email } = request.body;

		const blocked = await this.loinAttemptsService.isBlocked(email);
		if (blocked) {
			throw new HttpException("Слишком много неудачных попыток. Попробуйте через минуту.", 429);
		}

		return true;
	}
}
