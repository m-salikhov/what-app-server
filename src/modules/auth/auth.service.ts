import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { UserWithoutPassword } from "src/Shared/Types/UserWithoutPassword.type";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateUser(email: string, password: string) {
		const user = await this.usersService.getUserByEmail(email);
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) throw new UnauthorizedException("Неверный пароль");

		return user;
	}

	async login(user: UserWithoutPassword) {
		const payload = { username: user.username, id: user.id };

		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async getUserById(id: string) {
		const user = await this.usersService.getUserById(id);

		return user;
	}
}
