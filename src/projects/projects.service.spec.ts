import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockType } from '../shared/mocks/mock.type';
import { MockRepository } from '../shared/mocks/repository.mock';
import { Team } from '../teams/team.entity';
import { User } from '../users/user.entity';
import { ProjectsFindArgs } from './dto/projects-find.args';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: MockType<Repository<Project>>;
  let user: Partial<User>;
  let team: Partial<Team>;
  let project: Partial<Project>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
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

    team = {
      id: 1,
      name: 'My Awesome Team',
      description: 'A super awesome team',
      owner: user as User,
      members: [user as User],
      projects: [],
    };

    project = {
      id: 1,
      name: 'My Awesome Project',
      description: 'A super awesome project',
      creationDate: new Date(),
      owner: user as User,
      team: team as Team,
      tasks: [],
    };

    service = module.get<ProjectsService>(ProjectsService);
    repository = module.get(getRepositoryToken(Project));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a project', async () => {
    const input = { ...project, id: undefined, owner: undefined, teams: [] };
    repository.create.mockReturnValue(input);
    repository.save.mockReturnValue(project);
    expect(
      await service.create(
        { name: project.name, description: project.description },
        team as Team,
        user as User,
      ),
    ).toEqual(project);
  });

  it('should find one by ID', async () => {
    repository.findOne.mockReturnValue(project);
    expect(await service.findOneById(1)).toEqual(project);
  });

  it('should list all projects', async () => {
    const result = [
      { ...project, id: 1, name: 'Team Awesome 1' },
      { ...project, id: 2, name: 'Team Awesome 2' },
    ];
    repository.findAndCount.mockReturnValue([result, 2]);
    const args: Partial<ProjectsFindArgs> = { skip: 0, take: 25 };
    expect(await service.findAll(args as ProjectsFindArgs)).toEqual([
      result,
      2,
    ]);
  });

  it('should be updated', async () => {
    const output = { ...project, name: 'Updated Name' };
    repository.save.mockReturnValue(output);
    const result = await service.update(project as Project, {
      name: 'Updated Name',
    });
    expect(result).toEqual(output);
    expect(project).toEqual(output);
  });

  it('should be removed', async () => {
    const output = { ...project, id: undefined };
    repository.remove.mockReturnValue(output);
    expect(await service.remove(project as Project)).toEqual(output);
  });
});
