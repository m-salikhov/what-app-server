import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './modules/users/entity/user.entity';
import { UsersModule } from './modules/users/users.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { Tournament } from './Modules/tournaments/entities/tournament.entity';
import { Editor } from './Modules/tournaments/entities/editors.entity';
import { Question } from './Modules/tournaments/entities/question.entity';
import { Source } from './Modules/tournaments/entities/sourse.entity';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // // TypeOrmModule.forFeature([User, DocEntity]),

    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: '***REMOVED***',
      password: '***REMOVED***',
      database: '***REMOVED***',
      entities: [Tournament, User, Editor, Question, Source],
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
