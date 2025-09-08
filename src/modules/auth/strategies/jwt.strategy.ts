import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserWithoutPassword } from 'src/Shared/Types/UserWithoutPassword.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['access_token'];
          if (!data) {
            return null;
          }
          return data;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: { id: string; username: string },
  ): Promise<UserWithoutPassword> {
    const { id, username, role, date, email } =
      await this.authService.getUserById(payload.id);

    return { id, username, role, date, email };
  }
}
