import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User as UserModel } from '../users/models/user.model';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NewTeamInput } from './dto/new-team.input';
import { TeamsFindArgs } from './dto/teams-find.args';
import { UpdateTeamInput } from './dto/update-team.input';
import { Team as TeamModel } from './models/team.model';
import { Team } from './team.entity';
import { TeamsResolver } from './teams.resolver';
import { TeamsService } from './teams.service';

describe('TeamsResolver', () => {
  let resolver: TeamsResolver;
  let teamsService: Partial<TeamsService>;
  let usersService: Partial<UsersService>;
  let team: Partial<Team>;
  let user: Partial<User>;
  let teamModel: TeamModel;
  let userModel: UserModel;

  beforeEach(async () => {
    user = {
      id: 1,
      name: 'User Name',
      email: 'user@mail.com',
      isAdmin: false,
      creationDate: new Date(),
      password: 'hashedpassword',
      ownedTeams: [],
      teams: [],
    };

    team = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user as User,
      members: [user as User],
      projects: [],
    };

    userModel = {
      ...user,
      id: '1',
      teams: [],
      ownedTeams: [],
      tasks: [],
      myTasks: [],
      assignments: [],
    } as UserModel;

    teamModel = {
      ...team,
      id: '1',
      members: [],
      owner: userModel,
      projects: [],
    } as TeamModel;

    teamsService = {
      async findAll(args, ...relations) {
        return [[team as Team], 1];
      },
      async findOneById(id: number, ...relations: string[]): Promise<Team> {
        return team as Team;
      },
      async findOneByName(name: string, ...relations: string[]): Promise<Team> {
        return team as Team;
      },
      async create(data: NewTeamInput, owner: User): Promise<Team> {
        return team as Team;
      },
      async update(team: Team, data: Partial<Team>): Promise<Team> {
        return team as Team;
      },
      async remove(team: Team): Promise<Team> {
        return team as Team;
      },
      async addUser(team: Team, user: User): Promise<Team> {
        return team as Team;
      },
    };

    usersService = {
      async findOneById(id: number, ...relations: string[]): Promise<User> {
        return user as User;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsResolver,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: TeamsService,
          useValue: teamsService,
        },
      ],
    }).compile();

    resolver = module.get<TeamsResolver>(TeamsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should resolve the owner', async () => {
    expect(await resolver.owner(teamModel)).toEqual(user);
  });

  it('should resolve the members', async () => {
    expect(await resolver.members(teamModel)).toEqual([user]);
  });

  it('should resolve a team', async () => {
    expect(await resolver.team('1', userModel)).toEqual(team);
  });

  it('should throw a forbidden exception because the current user is not a member', async () => {
    teamsService.findOneById = async (id, ...relations) => {
      return { ...team, members: [] } as Team;
    };
    try {
      await resolver.team('1', userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenException);
    }
  });

  it('should throw a not found exception because the team does not exist when asking for a team', async () => {
    teamsService.findOneById = async (id, ...relations) => {
      return null;
    };
    try {
      await resolver.team('1', userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
    }
  });

  it('it should resolve all the teams', async () => {
    const args: Partial<TeamsFindArgs> = { skip: 0, take: 25 };
    expect(await resolver.teams(args as TeamsFindArgs)).toEqual({
      result: [team as Team],
      total: 1,
    });
  });

  it('should resolve all my teams', async () => {
    user.teams = [team as Team];
    expect(await resolver.myTeams(userModel)).toEqual([team]);
  });

  it('should create a team', async () => {
    teamsService.findOneByName = (name, ...relations) => {
      return null;
    };
    expect(await resolver.createTeam(teamModel, userModel)).toEqual(team);
  });

  it('should throw a bad request exception because a team with the same name already exists', async () => {
    try {
      await resolver.createTeam(teamModel, userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toEqual('team with same name already exists');
    }
  });

  it('should remove a team', async () => {
    expect(await resolver.removeTeam(teamModel.id, userModel)).toEqual(team);
  });

  it('should throw a not found exception when trying removing an unexisting team', async () => {
    teamsService.findOneById = (id, ...relations) => {
      return null;
    };
    try {
      await resolver.removeTeam(teamModel.id, userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.message).toEqual('team does not exist');
    }
  });

  it('should throw an unauthorized exception when trying removing a not ownered team', async () => {
    teamModel.owner = null;
    try {
      await resolver.removeTeam(teamModel.id, userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException);
      expect(err.message).toEqual('action not allowed');
    }
  });

  it('should update a team', async () => {
    expect(
      await resolver.updateTeam(teamModel.id, {} as UpdateTeamInput, userModel),
    ).toEqual(team);
  });

  it('should throw a not found exception when trying updating an unexisting team', async () => {
    teamsService.findOneById = (id, ...relations) => {
      return null;
    };
    try {
      await resolver.updateTeam(teamModel.id, {} as UpdateTeamInput, userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.message).toEqual('team does not exist');
    }
  });

  it('should throw an unauthorized exception when trying updating a not ownered team', async () => {
    teamModel.owner = null;
    try {
      await resolver.updateTeam(teamModel.id, {} as UpdateTeamInput, userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException);
      expect(err.message).toEqual('action not allowed');
    }
  });

  it('should add a new team member', async () => {
    expect(await resolver.addTeamMember(teamModel.id, '2', userModel)).toEqual(
      team,
    );
  });

  it('should throw a not found exception when trying adding a new member on an unexisting team', async () => {
    teamsService.findOneById = (id, ...relations) => {
      return null;
    };
    try {
      await resolver.addTeamMember(teamModel.id, '2', userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.message).toEqual('team does not exist');
    }
  });

  it('should throw a bad request exception when trying adding as a new member an unexisting user', async () => {
    usersService.findOneById = (id, ...relations) => {
      return null;
    };
    try {
      await resolver.addTeamMember(teamModel.id, '2', userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toEqual('user does not exist');
    }
  });
});
