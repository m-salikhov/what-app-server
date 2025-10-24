import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { UserWithoutPassword } from "src/Shared/Types/UserWithoutPassword.type";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({ usernameField: "email", passwordField: "password" });
	}
	async validate(email: string, password: string): Promise<UserWithoutPassword> {
		const { id, username, role, date } = await this.authService.validateUser(email, password);

		return { id, username, role, date, email };
	}
}
