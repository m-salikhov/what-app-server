import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { LoginStat } from './entities/loginstat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoginStat])],
  providers: [StatsService],
})
export class StatsModule {}
