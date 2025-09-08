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
import { Response, CookieOptions } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { StatsInterceptor } from '../stats/stats.interceptor';
import { ConfigService } from '@nestjs/config';
import { SelfGuard } from './guards/role.guard';
import { AuthenticatedRequest } from 'src/Shared/Types/AuthRequest.type';
import { UserWithoutPassword } from 'src/Shared/Types/UserWithoutPassword.type';

@UseInterceptors(StatsInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserWithoutPassword> {
    const { access_token } = await this.authService.login(req.user);

    const user = await this.authService.getUserById(req.user.id);

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      maxAge: this.configService.get('COOKIES_MAX_AGE'),
      sameSite: 'none',
      secure: true,
      partitioned: true,
    };

    response.cookie('access_token', access_token, cookieOptions);

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('login-first')
  async loginFirst(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { access_token } = await this.authService.login(req.user);

    const user = await this.authService.getUserById(req.user.id);

    response.cookie('access_token', access_token, {
      httpOnly: true,
      maxAge: this.configService.get('COOKIES_MAX_AGE'),
      sameSite: 'none',
      secure: true,
      partitioned: true,
    });

    return user;
  }

  @UseGuards(JwtAuthGuard, SelfGuard)
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
