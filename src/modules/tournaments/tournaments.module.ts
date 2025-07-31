import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Editor } from './entities/editors.entity';
import { Question } from './entities/question.entity';
import { Source } from './entities/source.entity';
import { Tournament } from './entities/tournament.entity';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([Tournament, Editor, Source, Question]),
    UsersModule,
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService],
})
export class TournamentsModule {}
