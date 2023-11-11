import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { User } from '../users/entity/user.entity';
import { StatsInterceptor } from '../stats/stats.interceptor';

export interface RequestAuth extends Request {
  user: User;
}

@UseInterceptors(StatsInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: RequestAuth,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(req.user);

    response.cookie('access_token', token.access_token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIES_MAX_AGE),
      sameSite: 'none',
      secure: true,
    });

    const { password, ...user } = req.user;
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logfirst')
  async loginFirst(
    @Req() req: RequestAuth,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(req.user);

    const { password, ...user } = await this.authService.getUser(req.user.id);

    response.cookie('access_token', token.access_token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIES_MAX_AGE),
      sameSite: 'none',
      secure: true,
    });

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('access_token', '', {
      httpOnly: true,
      maxAge: 1000,
      sameSite: 'none',
      secure: true,
    });

    return { message: 'logout' };
  }
}
