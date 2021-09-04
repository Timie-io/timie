import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Redis } from 'ioredis';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly config: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: any) {
    const loggedTime = await this.redis.get(`login_${payload.sub}`);
    if (!loggedTime) {
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      isAdmin: payload.admin,
      time: loggedTime,
    };
  }
}
