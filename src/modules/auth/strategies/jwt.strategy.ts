import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserWithoutPassword } from "src/Shared/Types/UserWithoutPassword.type";
import { AuthService } from "../auth.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private authService: AuthService,
		configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => request?.cookies.access_token ?? null,
			]),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>("SECRET"),
			passReqToCallback: true,
		});
	}

	async validate(
		_req: Request,
		payload: { id: string; username: string },
	): Promise<UserWithoutPassword> {
		const id = payload.id;

		const cachedUser = await this.cacheManager.get<UserWithoutPassword>(id);
		if (cachedUser) return cachedUser;

		const user = await this.authService.getUserById(id);

		await this.cacheManager.set(id, user);

		return user;
	}
}
