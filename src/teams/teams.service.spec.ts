import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { MockType } from '../shared/mocks/mock.type';
import { MockRepository } from '../shared/mocks/repository.mock';
import { User } from '../users/user.entity';
import { TeamsFindArgs } from './dto/teams-find.args';
import { TeamsViewArgs } from './dto/teams-view.args';
import { TeamView } from './team-view.entity';
import { Team } from './team.entity';
import { TeamsService } from './teams.service';

describe('TeamsService', () => {
  let service: TeamsService;
  let repository: MockType<Repository<Team>>;
  let viewRepository: MockType<Repository<TeamView>>;
  let user: Partial<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: getRepositoryToken(Team),
          useClass: MockRepository,
        },
        {
          provide: getRepositoryToken(TeamView),
          useClass: MockRepository,
        },
      ],
    }).compile();

    user = {
      id: 1,
      name: 'User Name',
      email: 'user@mail.com',
      isAdmin: false,
      creationDate: new Date(),
      password: 'hashedpassword',
      ownedTeams: [],
      teams: [],
      projects: [],
      tasks: [],
      myTasks: [],
    };

    service = module.get<TeamsService>(TeamsService);
    repository = module.get(getRepositoryToken(Team));
    viewRepository = module.get(getRepositoryToken(TeamView));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a team', async () => {
    const input = {
      name: 'My Awesome Team',
      description: 'A new awesome team',
    };
    const output = {
      ...input,
      id: 1,
    };
    repository.create.mockReturnValue(input);
    repository.save.mockReturnValue(output);
    expect(await service.create(input, user as User)).toEqual(output);
  });

  it('should remove a team', async () => {
    const output: Partial<Team> = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user as User,
      members: [],
      projects: [],
    };
    repository.remove.mockReturnValue(output);
    expect(await service.remove(output as Team)).toEqual(output);
  });

  it('should update a team', async () => {
    const team: Partial<Team> = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user as User,
      members: [],
      projects: [],
    };
    const data = {
      name: 'Not Awesome Team',
      description: "It's not so awesome",
    };
    const output = {
      ...team,
      ...data,
    };
    repository.save.mockReturnValue(output);
    expect(await service.update(team as Team, data)).toEqual(output);
  });

  it('should find one team by ID', async () => {
    const output = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user,
      members: [],
    };
    repository.findOne.mockReturnValue(output);
    // NOTE: we can't test here the relations feature
    expect(await service.findOneById(1)).toEqual(output);
  });

  it('should find one team by name', async () => {
    const output = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user,
      members: [],
    };
    repository.findOne.mockReturnValue(output);
    // NOTE: we can't test here the relations feature
    expect(await service.findOneByName('My Awesome Team')).toEqual(output);
  });

  it('should list all teams', async () => {
    const output = [
      {
        id: 1,
        name: 'My Awesome Team',
        description: 'An awesome team',
        owner: user,
        members: [],
      },
      {
        id: 2,
        name: 'My Awesome Team 2',
        description: 'Another awesome team',
        owner: user,
        members: [],
      },
    ];
    repository.findAndCount.mockReturnValue([output, 2]);
    const args: Partial<TeamsFindArgs> = { skip: 0, take: 25 };
    expect(await service.findAll(args as TeamsFindArgs)).toEqual([output, 2]);
  });

  it('should list all teams from the view', async () => {
    const output = [
      {
        id: 1,
        name: 'My Awesome Team 1',
      },
      {
        id: 2,
        name: 'My Awesome Team 2',
      },
    ];
    const query = {
      select: () => query,
      where: () => query,
      orWhere: () => query,
      andWhere: () => query,
      skip: () => query,
      take: () => query,
      orderBy: () => query,
      addOrderBy: () => query,
      getCount: () => 2,
      getMany: () => output,
      getRawOne: () => {
        return {
          total: 2,
        };
      },
    };
    viewRepository.createQueryBuilder.mockReturnValue({
      ...query,
    });
    const args: Partial<TeamsViewArgs> = {};
    expect(await service.findView(args as TeamsViewArgs)).toEqual([output, 2]);
  });

  it('should add a user as a team member', async () => {
    const input: Partial<Team> = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user as User,
      members: [],
      projects: [],
    };
    const output = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user,
      members: [user],
      ownedProjects: [],
      projects: [],
    };
    repository.save.mockReturnValue(output);
    const result = await service.addMember(input as Team, user as User);
    expect(input.members).toEqual([user]);
    expect(result).toEqual(output);
  });

  it('should remove a user as a team member', async () => {
    const input: Partial<Team> = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user as User,
      members: [user as User],
      projects: [],
    };
    const output = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user,
      members: [],
      ownedProjects: [],
      projects: [],
    };
    repository.save.mockReturnValue(output);
    const result = await service.removeMember(input as Team, user as User);
    expect(input.members).toEqual([]);
    expect(result).toEqual(output);
  });

  it('should add a new project', async () => {
    const project = {
      id: 1,
      name: 'My Project',
      description: 'An awesome project',
    } as Project;
    const input: Partial<Team> = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user as User,
      members: [],
      projects: [],
    };
    const output = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user,
      members: [],
      ownedProjects: [],
      projects: [project],
    };
    repository.save.mockReturnValue(output);
    const result = await service.addProject(input as Team, project);
    expect(input.projects).toEqual([project]);
    expect(result).toEqual(output);
  });
});
