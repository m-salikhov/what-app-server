import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserWithoutPassword } from "src/Shared/Types/UserWithoutPassword.type";
import { UsersService } from "../users/users.service";
import { LoginAttemptsService } from "./login-attempts.service";

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		private loginAttemptsService: LoginAttemptsService,
	) {}

	async validateUserLocal(email: string, password: string): Promise<UserWithoutPassword> {
		const user = await this.usersService.getUserByEmail(email);

		if (!user) {
			await this.loginAttemptsService.recordFailedAttempt(email);
			throw new UnauthorizedException("Неверный логин или пароль");
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			await this.loginAttemptsService.recordFailedAttempt(email);
			throw new UnauthorizedException("Неверный логин или пароль");
		}

		return user;
	}

	async makeAccessToken(username: UserWithoutPassword["username"], id: UserWithoutPassword["id"]) {
		const payload = { username, id };

		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async getUserById(id: UserWithoutPassword["id"]): Promise<UserWithoutPassword> {
		const { password: _, ...user } = await this.usersService.getUserById(id);

		return user;
	}
}
