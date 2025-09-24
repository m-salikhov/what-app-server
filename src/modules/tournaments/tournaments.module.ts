import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MailModule } from "../mail/mail.module";
import { UsersModule } from "../users/users.module";
import { Editor } from "./entities/editors.entity";
import { Question } from "./entities/question.entity";
import { Source } from "./entities/source.entity";
import { Tournament } from "./entities/tournament.entity";
import { TournamentsController } from "./tournaments.controller";
import { TournamentsService } from "./tournaments.service";

@Module({
	imports: [
		ConfigModule.forRoot(),
		MailModule,
		TypeOrmModule.forFeature([Tournament, Editor, Source, Question]),
		UsersModule,
	],
	controllers: [TournamentsController],
	providers: [TournamentsService],
})
export class TournamentsModule {}
