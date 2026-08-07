import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { UserWithoutPassword } from "src/Shared/Types/UserWithoutPassword.type";
import { AuthService } from "../auth.service";
import { LoginAttemptsService } from "../login-attempts.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly authService: AuthService,
		private loginAttemptsService: LoginAttemptsService,
	) {
		super({ usernameField: "email", passwordField: "password" });
	}
	async validate(email: string, password: string): Promise<UserWithoutPassword> {
		const user = await this.authService.validateUserLocal(email, password);

		await this.loginAttemptsService.resetAttempts(email);

		return user;
	}
}
