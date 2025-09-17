import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserWithoutPassword } from 'src/Shared/Types/UserWithoutPassword.type';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
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
    const id = payload.id;

    const cachedUser = await this.cacheManager.get<UserWithoutPassword>(id);
    if (cachedUser) {
      return cachedUser;
    }

    const { password, ...user } = await this.authService.getUserById(id);

    await this.cacheManager.set(id, user);

    return { ...user };
  }
}
