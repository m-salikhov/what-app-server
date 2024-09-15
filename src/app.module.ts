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

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...dataSourceOptions, autoLoadEntities: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../public'),
      serveRoot: '/public/',
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
