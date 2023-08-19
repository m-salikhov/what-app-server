import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { StatsService } from './stats.service';

@Injectable()
export class StatsMiddleware implements NestMiddleware {
  constructor(private statsService: StatsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.statsService.saveOpenStat(req);
    next();
  }
}
