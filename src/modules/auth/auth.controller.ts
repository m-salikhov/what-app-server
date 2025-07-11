import {
  Body,
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
    const { access_token } = await this.authService.login(req.user);

    response.cookie('access_token', access_token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIES_MAX_AGE),
      sameSite: 'none',
      secure: true,
    });

    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logfirst')
  async loginFirst(
    @Req() req: RequestAuth,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token } = await this.authService.login(req.user);

    const user = await this.authService.getUserById(req.user.id);

    response.cookie('access_token', access_token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIES_MAX_AGE),
      sameSite: 'none',
      secure: true,
    });

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return { message: 'logout' };
  }
}
