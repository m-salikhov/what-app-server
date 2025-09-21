import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entity/user.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ResultElem, UserResult } from '../users/entity/userResult.entity';
import { LoginStat } from '../stats/entities/loginstat.entity';
import { StatsService } from '../stats/stats.service';
import { StatsModule } from '../stats/stats.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheableMemory } from 'cacheable';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserResult,
      ResultElem,
      LoginStat,
      StatsModule,
    ]),

    CacheModule.registerAsync({
      useFactory: () => ({
        store: new CacheableMemory({
          ttl: 10 * 60 * 1000, // 10 минут
          lruSize: 500, // максимум 500 записей
        }),
      }),
    }),

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
export class AuthModule {}
