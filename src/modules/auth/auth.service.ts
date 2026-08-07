import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserWithoutPassword } from "src/Shared/Types/UserWithoutPassword.type";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
	) {}

	async validateUser(email: string, password: string): Promise<UserWithoutPassword> {
		const user = await this.usersService.getUserByEmail(email);
		if (!user) throw new UnauthorizedException("Неверный логин или пароль");

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) throw new UnauthorizedException("Неверный логин или пароль");

		return user;
	}

	async login(user: UserWithoutPassword) {
		const payload = { username: user.username, id: user.id };

		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async getUserById(id: string): Promise<UserWithoutPassword> {
		const { password: _, ...user } = await this.usersService.getUserById(id);

		return user;
	}
}
