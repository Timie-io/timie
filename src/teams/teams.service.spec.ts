import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { MockType } from '../shared/mocks/mock.type';
import { MockRepository } from '../shared/mocks/repository.mock';
import { User } from '../users/user.entity';
import { TeamsFindArgs } from './dto/teams-find.args';
import { Team } from './team.entity';
import { TeamsService } from './teams.service';

describe('TeamsService', () => {
  let service: TeamsService;
  let repository: MockType<Repository<Team>>;
  let user: Partial<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: getRepositoryToken(Team),
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
    const result = await service.addUser(input as Team, user as User);
    expect(input.members).toEqual([user]);
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
