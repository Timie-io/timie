import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpUser } from './dto/sign-up.user';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;
  let user: User;
  let tokenResponse: { access_token: string };

  beforeEach(async () => {
    user = {
      id: 12,
      email: 'user@mail.com',
      name: 'User Name',
      password: '1234',
      creationDate: new Date(),
      isAdmin: false,
    };
    tokenResponse = {
      access_token: 'thisistheaccesstoken',
    };
    authService = {
      login: async (user: User): Promise<{ access_token: string }> => {
        return tokenResponse;
      },
      signUp: async (body: SignUpUser): Promise<User> => {
        return user;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign in a user', async () => {
    const request = {
      user: user,
    };
    const result = await controller.signIn(request);
    expect(result).toEqual(tokenResponse);
  });

  it('should sign up a user', async () => {
    expect(
      await controller.signUp({
        email: user.email,
        password: undefined,
        name: user.name,
        isAdmin: false,
      }),
    ).toEqual(tokenResponse);
  });
});
