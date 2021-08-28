import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockType } from '../shared/mocks/mock.type';
import { MockRepository } from '../shared/mocks/repository.mock';
import { Team } from '../teams/team.entity';
import { User } from '../users/user.entity';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: MockType<Repository<Project>>;
  let user: User;
  let team: Team;
  let project: Project;

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
    };

    team = {
      id: 1,
      name: 'My Awesome Team',
      description: 'A super awesome team',
      owner: user,
      members: [user],
      ownedProjects: [],
      projects: [],
    };

    project = {
      id: 1,
      name: 'My Awesome Project',
      description: 'A super awesome project',
      creationDate: new Date(),
      owner: team,
      teams: [team],
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
        team,
      ),
    ).toEqual(project);
  });

  it('should find one by ID', async () => {
    repository.findOne.mockReturnValue(project);
    expect(await service.findOneById(1)).toEqual(project);
  });

  it('should find all by name', async () => {
    const result = [
      { ...project, id: 1, name: 'Team Awesome 1' },
      { ...project, id: 2, name: 'Team Awesome 2' },
    ];
    repository.findAndCount.mockReturnValue([result, 2]);
    expect(await service.findAllByName('Team Awesome', 0, 25)).toEqual([
      result,
      2,
    ]);
  });

  it('should be updated', async () => {
    const output = { ...project, name: 'Updated Name' };
    repository.save.mockReturnValue(output);
    const result = await service.update(project, { name: 'Updated Name' });
    expect(result).toEqual(output);
    expect(project).toEqual(output);
  });

  it('should be removed', async () => {
    const output = { ...project, id: undefined };
    repository.remove.mockReturnValue(output);
    expect(await service.remove(project)).toEqual(output);
  });
});
