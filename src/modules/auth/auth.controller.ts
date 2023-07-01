import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { User } from '../users/entity/user.entity';

interface RequestAuth extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logfirst')
  async loginFirst(
    @Req() req: RequestAuth,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(req.user);
    const user = await this.authService.getUser(req.user.id);
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
    return 'logout';
  }
}
