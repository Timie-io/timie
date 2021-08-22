import { Test, TestingModule } from '@nestjs/testing';
import { User } from './user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let usersService: Partial<UsersService>;
  let user: User;

  beforeEach(async () => {
    user = {
      id: 1,
      name: 'Steven Taylor',
      email: 'staylor@mail.com',
      creationDate: new Date(),
      isAdmin: false,
      password: 'somehashedpassword',
    };

    usersService = {
      findOneById: async (id: number) => {
        return user;
      },
      findOneByEmail: async (email: string) => {
        return user;
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return a user by ID', async () => {
    expect(await resolver.user('1')).toEqual(user);
  });
});
