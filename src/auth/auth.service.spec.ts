import { BadRequestException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { NewUserInput } from 'src/users/dto/new-user.input';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let user: Partial<User>;
  let password: string;

  beforeEach(async () => {
    password = '1234';
    user = {
      id: 12,
      email: 'user@mail.com',
      name: 'User Name',
      password: await AuthService.generateSaltedHashedPassword(password),
      creationDate: new Date(),
      isAdmin: false,
    };
    usersService = {
      findOneById: async (id: number): Promise<User> => {
        return user as User;
      },
      findOneByEmail: async (email: string): Promise<User> => {
        return user as User;
      },
      create: async (data: NewUserInput): Promise<User> => {
        return user as User;
      },
    };

    jwtService = {
      sign: (
        payload: string | Buffer | object,
        options?: JwtSignOptions,
      ): string => {
        return 'thisisageneratedtoken';
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate a user', async () => {
    const result = await service.validateUser(12, password);
    expect(result).toHaveProperty('email', user.email);
    expect(await service.validateUser(12, 'invalid')).toEqual(null);
  });

  it('should sign up a new user', async () => {
    usersService.findOneByEmail = async (email: string) => {
      return null;
    };
    const result = await service.signUp({
      email: user.email,
      password: password,
      name: user.name,
      isAdmin: false,
    });
    expect(result).toEqual(user);
  });

  it('should throw a email a use error', async () => {
    try {
      await service.signUp({
        email: user.email,
        password: password,
        name: user.name,
        isAdmin: false,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toEqual('email in use');
    }
  });

  it('should throw a password required error', async () => {
    usersService.findOneByEmail = async (email: string) => {
      return null;
    };
    try {
      await service.signUp({
        email: user.email,
        password: undefined,
        name: user.name,
        isAdmin: false,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toEqual('password required');
    }
  });

  it('should login a user signing the email and the ID in a JWT', async () => {
    const result = await service.login(user as User);
    expect(result).toEqual({ access_token: jwtService.sign({}) });
  });
});
