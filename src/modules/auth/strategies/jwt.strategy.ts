import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserWithoutPassword } from "src/Shared/Types/UserWithoutPassword.type";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private authService: AuthService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					const data = request?.cookies.access_token;
					if (!data) {
						return null;
					}
					return data;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: process.env.SECRET,
			passReqToCallback: true,
		});
	}

	async validate(
		_req: Request,
		payload: { id: string; username: string },
	): Promise<UserWithoutPassword> {
		const id = payload.id;

		const cachedUser = await this.cacheManager.get<UserWithoutPassword>(id);
		if (cachedUser) {
			return cachedUser;
		}

		const { password: _, ...user } = await this.authService.getUserById(id);

		await this.cacheManager.set(id, user);

		return { ...user };
	}
}
