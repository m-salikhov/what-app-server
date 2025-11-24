import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CacheableMemory } from "cacheable";
import { LoginStat } from "../stats/entities/loginstat.entity";
import { StatsModule } from "../stats/stats.module";
import { StatsService } from "../stats/stats.service";
import { User } from "../users/entity/user.entity";
import { ResultElem, UserResult } from "../users/entity/user-result.entity";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, UserResult, ResultElem, LoginStat, StatsModule]),

		CacheModule.registerAsync({
			useFactory: () => ({
				store: new CacheableMemory({
					ttl: 10 * 60 * 1000, // 10 минут
					lruSize: 500, // максимум 500 записей
				}),
			}),
		}),

		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: process.env.SECRET,
			signOptions: { expiresIn: process.env.JWT_EXPIRED },
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy, StatsService],
})
export class AuthModule {}
