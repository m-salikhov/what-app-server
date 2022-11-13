import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    const token = await this.authService.login(req.user);
    response.cookie('access_token', token.access_token, {
      httpOnly: true,
      maxAge: 86_400_000,
    });
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('logfirst')
  async loginFirst(@Req() req, @Res({ passthrough: true }) response: Response) {
    const token = await this.authService.login(req.user);
    const user = await this.authService.getUser(req.user.id);
    response.cookie('access_token', token.access_token, {
      httpOnly: true,
      maxAge: 86_400_000,
    });
    return user;
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('protected')
  // test(@Req() req, @Res({ passthrough: true }) response: Response) {
  //   console.log(req.cookies);
  //   response.cookie('key', 'value');
  //   return req.user;
  // }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Res({ passthrough: true }) response: Response, @Req() req) {
    console.log(req.cookies);
    response.cookie('access_token', '');
    return 'logout';
  }
}
