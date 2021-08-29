import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Team } from '../teams/team.entity';
import { TeamsService } from '../teams/teams.service';
import { User as UserModel } from '../users/models/user.model';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NewProjectInput } from './dto/new-project-input';
import { UpdateProjectInput } from './dto/update-project.input';
import { Project } from './project.entity';
import { ProjectsResolver } from './projects.resolver';
import { ProjectsService } from './projects.service';

describe('ProjectsResolver', () => {
  let resolver: ProjectsResolver;
  let user: Partial<User>;
  let userModel: UserModel;
  let team: Partial<Team>;
  let project: Partial<Project>;
  let usersService: Partial<UsersService>;
  let teamsService: Partial<TeamsService>;
  let projectsService: Partial<ProjectsService>;

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

    userModel = {
      ...user,
      id: '1',
      ownedTeams: [],
      teams: [],
    } as UserModel;

    team = {
      id: 1,
      name: 'My Awesome Team',
      description: 'An awesome team',
      owner: user as User,
      members: [user as User],
      projects: [],
    };

    project = {
      id: 1,
      name: 'Awesome Project',
      description: 'Such an awesome project',
      creationDate: new Date(),
      owner: user as User,
      team: team as Team,
    };

    usersService = {
      async findOneById(id: number, ...relations: string[]): Promise<User> {
        return user as User;
      },
    };

    teamsService = {
      async findOneById(id: number, ...relations: string[]): Promise<Team> {
        return team as Team;
      },
    };

    projectsService = {
      async create(data, team, user) {
        return project as Project;
      },
      async update(project, data) {
        return project as Project;
      },
      async remove(project) {
        return project as Project;
      },
      async findOneById(id, ...relations) {
        return project as Project;
      },
      async findAllByName(name, skip, take, ...relations) {
        return [[project as Project], 1];
      },
      async findAll(skip, take, ...relations) {
        return [[project as Project], 1];
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsResolver,
        {
          provide: ProjectsService,
          useValue: projectsService,
        },
        {
          provide: TeamsService,
          useValue: teamsService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    resolver = module.get<ProjectsResolver>(ProjectsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should resolve a project by ID', async () => {
    expect(await resolver.project('1')).toEqual(project);
  });

  it('should throw a not found exception when a project with a given ID is not found', async () => {
    projectsService.findOneById = async (id) => {
      return null;
    };
    try {
      await resolver.project('1');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
    }
  });

  it('should resolve all projects', async () => {
    const projects: Project[] = [
      project as Project,
      { ...project, id: 2, name: 'Another Project' } as Project,
    ];
    projectsService.findAll = async (skip, take, ...relations) => {
      return [projects, 2];
    };
    expect(await resolver.projects({ skip: 0, take: 25 })).toEqual({
      result: projects,
      total: 2,
    });
  });

  it('should resolve my projects', async () => {
    const projects: Project[] = [
      project as Project,
      { ...project, id: 2, name: 'Another Project' } as Project,
    ];
    user.projects = projects;
    expect(await resolver.myProjects(userModel)).toEqual(projects);
  });

  it('should resolve a list of projects for a given team', async () => {
    const output = [
      project as Project,
      { ...project, id: 2, name: 'Another Project' } as Project,
    ];
    team.projects = output;
    expect(await resolver.projectsByTeamId('1')).toEqual(output);
  });

  it('should throw a team not found error when asking for a teams projects', async () => {
    teamsService.findOneById = async (id) => {
      return null;
    };
    try {
      await resolver.projectsByTeamId('1');
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.message).toEqual('team not found');
    }
  });

  it('should resolve a list of projects by name', async () => {
    const projects = [
      project as Project,
      { ...project, id: 2, name: 'Another Project' } as Project,
    ];
    projectsService.findAllByName = async (name, skip, take, ...relations) => {
      return [projects, 2];
    };
    expect(
      await resolver.projectsByName('awesome', { skip: 0, take: 25 }),
    ).toEqual({
      result: projects,
      total: 2,
    });
  });

  it('should create a new project', async () => {
    expect(
      await resolver.createProject(
        project as NewProjectInput,
        undefined,
        userModel,
      ),
    ).toEqual(project);
  });

  it('should throw a team not found exception when creating a project', async () => {
    teamsService.findOneById = async (id) => {
      return null;
    };
    try {
      await resolver.createProject(project as NewProjectInput, '1', userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.message).toEqual('team not found');
    }
  });

  it('should update a project', async () => {
    expect(
      await resolver.updateProject(
        '1',
        project as UpdateProjectInput,
        userModel,
      ),
    ).toEqual(project);
  });

  it('should throw a not found error when trying updating a project', async () => {
    projectsService.findOneById = async (id) => {
      return null;
    };
    try {
      await resolver.updateProject(
        '1',
        project as UpdateProjectInput,
        userModel,
      );
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.message).toEqual('project not found');
    }
  });

  it('should throw an unauthorized error when trying updating a project', async () => {
    project.owner = { ...user, id: 2 } as User;
    try {
      await resolver.updateProject(
        '1',
        project as UpdateProjectInput,
        userModel,
      );
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException);
      expect(err.message).toEqual('action not allowed');
    }
  });

  it('should remove a project', async () => {
    expect(await resolver.removeProject('1', userModel)).toEqual(project);
  });

  it('should throw a not found error when trying removing a project', async () => {
    projectsService.findOneById = async (id) => {
      return null;
    };
    try {
      await resolver.removeProject('1', userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException);
      expect(err.message).toEqual('project not found');
    }
  });

  it('should throw an unauthorized error when trying removing a project', async () => {
    project.owner = { ...user, id: 2 } as User;
    try {
      await resolver.removeProject('1', userModel);
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException);
      expect(err.message).toEqual('action not allowed');
    }
  });
});
