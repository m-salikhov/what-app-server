import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entity/user.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ResultElem, UserResult } from '../users/entity/userResult.entity';
import { StatsMiddleware } from '../stats/stats.middleware';
import { LoginStat } from '../stats/entities/loginstat.entity';
import { OpenStat } from '../stats/entities/openstat.entity';
import { StatsService } from '../stats/stats.service';
import { StatsModule } from '../stats/stats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserResult,
      ResultElem,
      LoginStat,
      OpenStat,
      StatsModule,
    ]),
    ConfigModule.forRoot(),
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
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StatsMiddleware)
      .forRoutes({ path: 'auth/logfirst', method: RequestMethod.GET });
  }
}
