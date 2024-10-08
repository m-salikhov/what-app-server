import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { LoginStat } from './entities/loginstat.entity';
import { RequestAuth } from '../auth/auth.controller';
import { OpenStat } from './entities/openstat.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(OpenStat)
    private openStatsRepo: Repository<OpenStat>,
    @InjectRepository(LoginStat)
    private loginStatsRepo: Repository<LoginStat>,
  ) {}

  async saveOpenStat(req: Request) {
    const { timestamp, ip } = this.getCommonStatsFromRequest(req);
    const userAgent = req.headers['user-agent'];
    const host = req.headers.host;

    const newStat = this.openStatsRepo.create({
      host,
      ip,
      timestamp,
      userAgent,
    });

    this.openStatsRepo.save({
      ...newStat,
    });
  }

  async saveLoginStat(req: RequestAuth) {
    const { timestamp, ip } = this.getCommonStatsFromRequest(req);
    const username = req.user.username;
    const userID = req.user.id;

    const newLoginStat = this.loginStatsRepo.create({
      userID,
      username,
      ip,
      timestamp,
    });

    this.loginStatsRepo.save({
      ...newLoginStat,
    });
  }

  private getCommonStatsFromRequest(req: RequestAuth | Request) {
    const ip = req.ip;

    const dateNow = new Date();

    const timestamp = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZone: 'Europe/Moscow',
    }).format(dateNow);

    return { ip, timestamp };
  }
}
