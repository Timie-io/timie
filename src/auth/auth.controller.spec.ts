import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpUser } from './dto/sign-up.user';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      login: async (user: User): Promise<{ access_token: string }> => {
        return {
          access_token: 'thisistheaccesstoken',
        };
      },
      signUp: async (body: SignUpUser): Promise<User> => {
        return {
          id: 12,
          email: 'user@mail.com',
          name: 'User Name',
          password: '1234',
          creationDate: new Date(),
          isAdmin: false,
        } as User;
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
});
