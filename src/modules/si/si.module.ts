import { Module } from '@nestjs/common';
import { SiGateway } from './si.gateway';
import { SiService } from './si.service';

@Module({
  providers: [SiGateway, SiService],
})
export class SiModule {}
