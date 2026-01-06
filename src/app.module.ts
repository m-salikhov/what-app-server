import { join } from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { MailModule } from "./modules/mail/mail.module";
import { SiModule } from "./modules/si/si.module";
import { TournamentsModule } from "./modules/tournaments/tournaments.module";
import { UsersModule } from "./modules/users/users.module";
import { WordleModule } from "./modules/wordle/wordle.module";
import { dataSourceOptions } from "./typeorm.datasource";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: "../.env",
			isGlobal: true,
		}),

		TypeOrmModule.forRoot({
			...dataSourceOptions,
			autoLoadEntities: true,
			retryAttempts: 10,
			retryDelay: 3000,
		}),

		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "../public"),
			serveRoot: "/public/",
		}),

		ScheduleModule.forRoot(),

		UsersModule,
		TournamentsModule,
		AuthModule,
		WordleModule,
		MailModule,
		SiModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
