import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { promisify } from 'util';
import { SignUpUser } from './dto/sign-up.user';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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
      throw new BadRequestException('password is required');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(attrs.password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    attrs.password = result;

    return await this.usersService.create(attrs);
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
