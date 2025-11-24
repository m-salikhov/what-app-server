import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MailModule } from "../mail/mail.module";
import { User } from "./entity/user.entity";
import { ResultElem, UserResult } from "./entity/user-result.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
	imports: [
		MailModule,
		TypeOrmModule.forFeature([User, UserResult, ResultElem]),
		ConfigModule.forRoot(),
		JwtModule.register({
			secret: process.env.SECRET,
			signOptions: { expiresIn: process.env.JWT_EXPIRED },
		}),
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
