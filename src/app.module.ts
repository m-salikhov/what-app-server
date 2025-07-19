import { Module } from '@nestjs/common';
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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../public'),
      serveRoot: '/public/',
    }),

    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true,
    }),

    UsersModule,
    TournamentsModule,
    AuthModule,
    WordleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
