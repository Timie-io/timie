import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';
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
    const payload = { email: user.email, sub: user.id, admin: user.isAdmin };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
