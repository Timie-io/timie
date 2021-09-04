import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Redis } from 'ioredis';
import { promisify } from 'util';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { SignUpUser } from './dto/sign-up.user';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  static async generateSaltedHashedPassword(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    return salt + '.' + hash.toString('hex');
  }

  async validateUser(
    userId: number,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findOneById(userId);

    if (user) {
      const [salt, storedHash] = user.password.split('.');

      const hash = (await scrypt(password, salt, 32)) as Buffer;

      if (storedHash === hash.toString('hex')) {
        const { password, ...result } = user;
        return result;
      }
    }

    return null;
  }

  async signUp(attrs: SignUpUser): Promise<User> {
    const user = await this.usersService.findOneByEmail(attrs.email);
    if (user) {
      throw new BadRequestException('email in use');
    }
    if (!attrs.password) {
      throw new BadRequestException('password required');
    }

    attrs.password = await AuthService.generateSaltedHashedPassword(
      attrs.password,
    );

    return await this.usersService.create(attrs);
  }

  async login(user: User) {
    const loggedTime = new Date().toISOString();
    const payload = {
      email: user.email,
      sub: user.id,
      admin: user.isAdmin,
      time: loggedTime,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });
    await this.redis.set(`login_${user.id}`, loggedTime);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async logout(user: User) {
    return await this.redis.del(`login_${user.id}`);
  }
}
