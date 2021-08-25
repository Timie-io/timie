import { UnauthorizedException } from '@nestjs/common';
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
    const currentUser = {
      id: '1',
      name: user.name,
      email: user.email,
      creationDate: user.creationDate,
      isAdmin: user.isAdmin,
      password: user.password,
    };
    expect(await resolver.getUserById('1', currentUser)).toEqual(user);
  });

  it('should throw unauthorized error when asking for a user and not me or not admin', async () => {
    const currentUser = {
      id: '1',
      name: user.name,
      email: user.email,
      creationDate: user.creationDate,
      isAdmin: user.isAdmin,
      password: user.password,
    };
    try {
      await resolver.getUserById('2', currentUser);
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('should not throw unauthorized error when asking for a user and Im admin', async () => {
    const currentUser = {
      id: '1',
      name: user.name,
      email: user.email,
      creationDate: user.creationDate,
      isAdmin: true,
      password: user.password,
    };
    expect(await resolver.getUserById('2', currentUser)).toEqual(user);
  });

  it('should return my user data (me)', async () => {
    const currentUser = {
      id: '1',
      name: user.name,
      email: user.email,
      creationDate: user.creationDate,
      isAdmin: false,
      password: user.password,
    };
    const returnedUser = { ...currentUser } as any;
    returnedUser['id'] = 1;

    expect(await resolver.getLoggedUser(currentUser)).toEqual(returnedUser);
  });
});
