import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User as UserModel } from './models/user.model';
import { User } from './user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let usersService: Partial<UsersService>;
  let user: Partial<User>;
  let currentUser: UserModel;

  beforeEach(async () => {
    user = {
      id: 1,
      name: 'Steven Taylor',
      email: 'staylor@mail.com',
      creationDate: new Date(),
      isAdmin: false,
      password: 'somehashedpassword',
    };

    currentUser = {
      id: '1',
      name: user.name,
      email: user.email,
      creationDate: user.creationDate,
      isAdmin: user.isAdmin,
      password: user.password,
      teams: [],
      ownedTeams: [],
      tasks: [],
      myTasks: [],
    };

    usersService = {
      findOneById: async (id: number) => {
        return user as User;
      },
      findOneByEmail: async (email: string) => {
        return user as User;
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
    expect(await resolver.user('1', currentUser)).toEqual(user);
  });

  it('should throw unauthorized error when asking for a user and not me or not admin', async () => {
    try {
      await resolver.user('2', currentUser);
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('should not throw unauthorized error when asking for a user and Im admin', async () => {
    currentUser.isAdmin = true;
    expect(await resolver.user('2', currentUser)).toEqual(user);
  });

  it('should return my user data (me)', async () => {
    const returnedUser = { ...currentUser } as any;
    returnedUser['id'] = 1;

    usersService.findOneById = async (id, ...relations) => {
      return returnedUser;
    };

    expect(await resolver.loggedUser(currentUser)).toEqual(returnedUser);
  });

  it('should resolve all teams where I am a member', async () => {
    const returnedUser = { ...currentUser, id: 1 } as any;
    returnedUser['teams'] = [
      { name: 'Awesome team', description: 'An Awesome team' },
    ];
    usersService.findOneById = async (id, ...relations) => {
      return returnedUser;
    };
    expect(await resolver.teams(currentUser)).toEqual(returnedUser['teams']);
  });

  it('should resolve all my owned teams', async () => {
    const returnedUser = { ...currentUser, id: 1 } as any;
    returnedUser['ownedTeams'] = [
      { name: 'Awesome team', description: 'An Awesome team' },
    ];
    usersService.findOneById = async (id, ...relations) => {
      return returnedUser;
    };
    expect(await resolver.ownedTeams(currentUser)).toEqual(
      returnedUser['ownedTeams'],
    );
  });
});
