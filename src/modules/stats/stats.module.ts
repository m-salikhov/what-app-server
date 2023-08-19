import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { LoginStat } from './entities/loginstat.entity';
import { OpenStat } from './entities/openstat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OpenStat, LoginStat])],
  providers: [StatsService],
})
export class StatsModule {}
