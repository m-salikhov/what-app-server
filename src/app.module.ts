import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './modules/users/entity/user.entity';
import { UsersModule } from './modules/users/users.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { Tournament } from './modules/tournaments/entities/tournament.entity';
import { Editor } from './modules/tournaments/entities/editors.entity';
import { Question } from './modules/tournaments/entities/question.entity';
import { Source } from './modules/tournaments/entities/sourse.entity';
import { AuthModule } from './modules/auth/auth.module';
import {
  ResultElem,
  UserResult,
} from './modules/users/entity/userResult.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      type: 'mysql',
      host: process.env.HOST,
      port: 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        Tournament,
        User,
        Editor,
        Question,
        Source,
        UserResult,
        ResultElem,
      ],
      // entities: [__dirname + '/../**/*.entity.{js,ts}'],
      synchronize: true,
    }),
    UsersModule,
    TournamentsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
