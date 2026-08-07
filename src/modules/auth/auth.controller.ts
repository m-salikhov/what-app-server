import { CACHE_MANAGER, type Cache } from "@nestjs/cache-manager";
import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Post,
	Req,
	Res,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CookieOptions, Response } from "express";
import { AuthenticatedRequest } from "src/Shared/Types/AuthRequest.type";
import { UserWithoutPassword } from "src/Shared/Types/UserWithoutPassword.type";
import { StatsInterceptor } from "../stats/stats.interceptor";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { LoginAttemptsGuard } from "./guards/login-attempts.guard";
import { LoginAttemptsService } from "./login-attempts.service";

@UseInterceptors(StatsInterceptor)
@Controller("auth")
export class AuthController {
	constructor(
		private authService: AuthService,
		private configService: ConfigService,
		private loginAttemptsService: LoginAttemptsService,

		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	@UseGuards(LoginAttemptsGuard, LocalAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post("login")
	async login(
		@Req() req: AuthenticatedRequest,
		@Res({ passthrough: true }) response: Response,
	): Promise<UserWithoutPassword> {
		const { email, username, id } = req.user;

		this.loginAttemptsService.resetAttempts(email);

		const { access_token } = await this.authService.makeAccessToken(username, id);

		const cookieOptions: CookieOptions = {
			httpOnly: true,
			maxAge: this.configService.get("COOKIES_MAX_AGE"),
			sameSite: "none",
			secure: true,
			partitioned: true,
		};

		response.cookie("access_token", access_token, cookieOptions);

		return req.user;
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Get("login-first")
	async loginFirst(
		@Req() req: AuthenticatedRequest,
		@Res({ passthrough: true }) response: Response,
	) {
		const { username, id } = req.user;

		const { access_token } = await this.authService.makeAccessToken(username, id);

		response.cookie("access_token", access_token, {
			httpOnly: true,
			maxAge: this.configService.get("COOKIES_MAX_AGE"),
			sameSite: "none",
			secure: true,
			partitioned: true,
		});

		return req.user;
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post("logout")
	logout(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) response: Response) {
		this.cacheManager.del(req.user.id);

		response.clearCookie("access_token", {
			httpOnly: true,
			sameSite: "none",
			secure: true,
			partitioned: true,
		});

		return { message: "logout" };
	}
}
