import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { MockType } from '../shared/mocks/mock.type';
import { MockRepository } from '../shared/mocks/repository.mock';
import { User } from '../users/user.entity';
import { TasksFindArgs } from './dto/tasks-find.args';
import { TasksViewArgs } from './dto/tasks-view.args';
import { TaskView } from './task-view.entity';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let repository: MockType<Repository<Task>>;
  let viewRepository: MockType<Repository<TaskView>>;
  let user: Partial<User>;
  let project: Partial<Project>;
  let task: Partial<Task>;
  let taskView: Partial<TaskView>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useClass: MockRepository,
        },
        {
          provide: getRepositoryToken(TaskView),
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
      owner: user as User,
      team: undefined,
      tasks: [],
    };

    task = {
      id: 1,
      title: 'This is a task',
      description: 'This is a task description',
      project: project as Project,
      creationDate: new Date(),
      priority: 1,
      creator: user as User,
      followers: [user as User],
      active: true,
    };

    taskView = {
      id: task.id,
      title: task.title,
      description: task.description,
      projectName: project.name,
      created: task.creationDate,
      priority: task.priority,
      creatorName: user.name,
      active: task.active,
    };

    service = module.get<TasksService>(TasksService);
    repository = module.get(getRepositoryToken(Task));
    viewRepository = module.get(getRepositoryToken(TaskView));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a task', async () => {
    repository.create.mockReturnValue(task);
    repository.save.mockReturnValue(task);
    expect(
      await service.create(task, project as Project, user as User),
    ).toEqual(task);
  });

  it('should find one task by ID', async () => {
    repository.findOne.mockReturnValue(task);
    expect(await service.findOneById(1)).toEqual(task);
  });

  it('should find all tasks', async () => {
    const output = [task, { ...task, id: 2 }];
    const query = {
      getCount: () => 2,
      getMany: () => output,
      andWhere: () => query,
      orderBy: () => query,
      addOrderBy: () => query,
      take: () => query,
      skip: () => query,
    };
    repository.createQueryBuilder.mockReturnValue({
      ...query,
    });
    const args: Partial<TasksFindArgs> = {};
    expect(await service.findAll(args as TasksFindArgs)).toEqual([output, 2]);
  });

  it('should find all tasks from the view', async () => {
    const output = [taskView, { ...taskView, id: 2 }];
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
    const args: Partial<TasksViewArgs> = {};
    expect(await service.findView(args as TasksViewArgs)).toEqual([output, 2]);
  });

  it('should update a task', async () => {
    const newTask = { ...task, description: 'Task Updated' };
    repository.save.mockReturnValue(newTask);
    expect(
      await service.update(task as Task, { description: 'Task Updated' }),
    ).toEqual(newTask);
    expect(task.description).toEqual(newTask.description);
    expect(task.lastModified).toBeDefined();
  });

  it('should remove a task', async () => {
    repository.remove.mockReturnValue(task);
    expect(await service.remove(task as Task)).toEqual(task);
  });

  it('should add a follower', async () => {
    task.followers = [];
    repository.save.mockReturnValue(task);
    const newTask = await service.addFollower(task as Task, user as User);
    expect(newTask.followers).toEqual([user]);
  });

  it('should remove a follower', async () => {
    task.followers = [user as User];
    repository.save.mockReturnValue(task);
    const newTask = await service.removeFollower(task as Task, user as User);
    expect(newTask.followers).toEqual([]);
  });
});
