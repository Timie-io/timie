import { Test, TestingModule } from '@nestjs/testing';
import { Project } from '../projects/project.entity';
import { ProjectsService } from '../projects/projects.service';
import { User as UserModel } from '../users/models/user.model';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NewTaskInput } from './dto/new-task.input';
import { TasksFindArgs } from './dto/tasks-find.args';
import { UpdateTaskInput } from './dto/update-task.input';
import { Task } from './task.entity';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';

describe('TasksResolver', () => {
  let resolver: TasksResolver;
  let user: Partial<User>;
  let currentUser: Partial<UserModel>;
  let task: Partial<Task>;
  let tasks: Task[];
  let project: Partial<Project>;
  let tasksService: Partial<TasksService>;
  let projectsService: Partial<ProjectsService>;
  let usersService: Partial<UsersService>;

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
      name: 'Steven Taylor',
      email: 'staylor@mail.com',
      creationDate: new Date(),
      isAdmin: false,
    };
    project = {
      id: 1,
      name: 'Awesome Project',
      description: 'Such an awesome project',
      creationDate: new Date(),
      owner: user as User,
    };
    task = {
      id: 1,
      title: 'Amazing Task',
      description: 'This is an amazing task',
      priority: 1,
      creationDate: new Date(),
      followers: [user as User],
      creator: user as User,
      project: project as Project,
      active: true,
    };

    tasks = [task as Task, { ...task, id: 2 } as Task];

    tasksService = {
      async findOneById(id, ...relations) {
        return task as Task;
      },
      async findAll(args, ...relations) {
        return [tasks, 2];
      },
      async create(data, project, user) {
        return task as Task;
      },
      async remove(task) {
        return task as Task;
      },
      async update(task, data) {
        Object.assign(task, data);
        return task as Task;
      },
      async addFollower(task, user) {
        task.followers.push(user);
        return task;
      },
      async removeFollower(task, user) {
        task.followers = task.followers.filter(
          (follower) => follower.id !== user.id,
        );
        return task;
      },
    };

    projectsService = {
      async findOneById(id, ...relations) {
        return project as Project;
      },
    };

    usersService = {
      async findOneById(id, ...relations) {
        return user as User;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksResolver,
        {
          provide: TasksService,
          useValue: tasksService,
        },
        {
          provide: ProjectsService,
          useValue: projectsService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    resolver = module.get<TasksResolver>(TasksResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should resolve a task by ID', async () => {
    expect(await resolver.task('1')).toEqual(task);
  });

  it('should resolve a list of tasks', async () => {
    const args: Partial<TasksFindArgs> = {
      skip: 0,
      take: 25,
    };
    expect(await resolver.tasks(args as TasksFindArgs)).toEqual({
      result: tasks,
      total: 2,
    });
  });

  it('should create a task', async () => {
    const newTaskInput: Partial<NewTaskInput> = { ...task, projectId: '1' };
    expect(
      await resolver.createTask(
        newTaskInput as NewTaskInput,
        currentUser as UserModel,
      ),
    ).toEqual(task);
  });

  it('should update a task', async () => {
    const data = { description: 'Task description updated' };
    const newTask = { ...task, ...data };
    expect(await resolver.updateTask('1', data as UpdateTaskInput)).toEqual(
      newTask,
    );
  });

  it('should remove a task', async () => {
    expect(await resolver.removeTask('1')).toEqual(task);
  });

  it('should add a user as follower', async () => {
    const follower = { ...user, id: 2 };
    usersService.findOneById = async (id, ...relations) => {
      return follower as User;
    };
    const updatedTask = await resolver.addTaskFollower('1', '2');
    expect(updatedTask.followers.length).toEqual(2);
    expect(updatedTask.followers).toContain(follower);
  });

  it('should remove a user as follower', async () => {
    const follower = { ...user, id: 2 };
    usersService.findOneById = async (id, ...relations) => {
      return follower as User;
    };
    const updatedTask = await resolver.removeTaskFollower('1', '2');
    expect(updatedTask.followers.length).toEqual(1);
    expect(updatedTask.followers).not.toContain(follower);
  });
});
