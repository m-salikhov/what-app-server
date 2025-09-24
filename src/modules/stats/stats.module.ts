import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoginStat } from "./entities/loginstat.entity";
import { StatsService } from "./stats.service";

@Module({
	imports: [TypeOrmModule.forFeature([LoginStat])],
	providers: [StatsService],
})
export class StatsModule {}
