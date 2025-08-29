import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { AuthModule } from './modules/auth/auth.module';
import { dataSourceOptions } from './typeorm.datasource';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { WordleModule } from './modules/wordle/wordle.module';
import { MailModule } from './modules/mail/mail.module';
import { SiModule } from './modules/si/si.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
      retryAttempts: 10,
      retryDelay: 3000,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../public'),
      serveRoot: '/public/',
    }),

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
