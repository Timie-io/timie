import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { MockType } from '../shared/mocks/mock.type';
import { MockRepository } from '../shared/mocks/repository.mock';
import { User } from '../users/user.entity';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let repository: MockType<Repository<Task>>;
  let user: User;
  let project: Project;
  let task: Task;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
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

    project = {
      id: 1,
      name: 'My Awesome Project',
      description: 'A super awesome project',
      creationDate: new Date(),
      owner: user,
      team: undefined,
      tasks: [],
    };

    task = {
      id: 1,
      title: 'This is a task',
      description: 'This is a task description',
      project: project,
      creationDate: new Date(),
      priority: 1,
      creator: user,
      followers: [user],
      active: true,
    };

    service = module.get<TasksService>(TasksService);
    repository = module.get(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a task', async () => {
    repository.create.mockReturnValue(task);
    repository.save.mockReturnValue(task);
    expect(await service.create(task, project, user)).toEqual(task);
  });

  it('should find one task by ID', async () => {
    repository.findOne.mockReturnValue(task);
    expect(await service.findOneById(1)).toEqual(task);
  });

  it('should find all tasks', async () => {
    const output = [task, { ...task, id: 2 }];
    repository.findAndCount.mockReturnValue([output, 2]);
    expect(
      await service.findAll({
        skip: 0,
        take: 25,
        title: undefined,
        projectId: undefined,
        active: true,
      }),
    ).toEqual([output, 2]);
  });

  it('should update a task', async () => {
    const newTask = { ...task, description: 'Task Updated' };
    repository.save.mockReturnValue(newTask);
    expect(await service.update(task, { description: 'Task Updated' })).toEqual(
      newTask,
    );
    expect(task).toEqual(newTask);
  });

  it('should remove a task', async () => {
    repository.remove.mockReturnValue(task);
    expect(await service.remove(task)).toEqual(task);
  });
});
