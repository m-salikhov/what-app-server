import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	Param,
	Post,
	Put,
	Res,
	UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { publicAccount } from "src/Shared/constants/user.constants";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { AdminGuard, SelfGuard } from "../auth/guards/role.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdatePassDto } from "./dto/update-password.dto";
import { UserResultDto } from "./dto/user-result.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService,
	) {}

	@Post()
	async createUser(
		@Body() createUserDto: CreateUserDto,
		@Res({ passthrough: true }) response: Response,
	) {
		const { savedUser, access_token } = await this.usersService.createUser(createUserDto);

		response.cookie("access_token", access_token, {
			httpOnly: true,
			maxAge: this.configService.get("COOKIES_MAX_AGE"),
			sameSite: "none",
			secure: true,
			partitioned: true,
		});

		return savedUser;
	}

	@UseGuards(JwtAuthGuard, SelfGuard)
	@Put("/:id/change-password")
	async updateUser(@Body() updatePassDto: UpdatePassDto, @Param("id") id: string) {
		if (id === publicAccount.id) {
			throw new ForbiddenException("Нельзя изменить пароль этого пользователя");
		}

		return await this.usersService.updatePassword(id, updatePassDto.newPass);
	}

	@UseGuards(JwtAuthGuard)
	@Post("/user-result")
	async createTournament(@Body() userResultDto: UserResultDto) {
		return await this.usersService.createUserResult(userResultDto);
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Get("/:email")
	async getUser(@Param("email") email: string) {
		return await this.usersService.getUserByEmail(email);
	}

	@UseGuards(JwtAuthGuard, SelfGuard)
	@Get("/:id/user-result-full")
	async getUserResultFull(@Param("id") id: string) {
		return await this.usersService.getUserResultFull(id);
	}

	@UseGuards(JwtAuthGuard, SelfGuard)
	@Get("/:id/user-result-short")
	async getUserResultShort(@Param("id") id: string) {
		return await this.usersService.getUserResultShort(id);
	}

	@UseGuards(JwtAuthGuard, AdminGuard)
	@Delete(":id")
	async deleteUser(@Param("id") id: string) {
		return await this.usersService.deleteUser(id);
	}
}
