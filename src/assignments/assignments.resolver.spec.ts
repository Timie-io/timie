import { Test, TestingModule } from '@nestjs/testing';
import { Status } from '../status/status.entity';
import { StatusService } from '../status/status.service';
import { Task } from '../tasks/task.entity';
import { TasksService } from '../tasks/tasks.service';
import { User as UserModel } from '../users/models/user.model';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Assignment } from './assignment.entity';
import { AssignmentsResolver } from './assignments.resolver';
import { AssignmentsService } from './assignments.service';
import { AssignmentsFindArgs } from './dto/assignments-find.args';
import { NewAssignmentInput } from './dto/new-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment.input';

describe('AssignmentsResolver', () => {
  let resolver: AssignmentsResolver;
  let assignmentsService: Partial<AssignmentsService>;
  let statusService: Partial<StatusService>;
  let tasksService: Partial<TasksService>;
  let usersService: Partial<UsersService>;
  let assignment: Partial<Assignment>;
  let status: Partial<Status>;
  let task: Partial<Task>;
  let user: Partial<User>;
  let currentUser: Partial<UserModel>;

  beforeEach(async () => {
    user = {
      id: 1,
      name: 'User Name',
      email: 'user@mail.com',
    };

    currentUser = {
      id: '1',
      name: 'User Name',
      email: 'user@mail.com',
    };

    task = {
      id: 1,
      title: 'Amazing Task',
      description: 'This is an amazing task',
    };

    status = {
      code: 'O',
      label: 'Open',
      order: 1,
    };

    assignment = {
      id: 1,
      title: 'An assignment',
      description: 'This is an assignment',
      status: status as Status,
      user: user as User,
      creator: user as User,
    };

    assignmentsService = {
      async findOneById(id, ...relations) {
        return assignment as Assignment;
      },
      async findAll(args, ...relations) {
        return [[assignment as Assignment], 1];
      },
      async create(data, task, user, creator, status) {
        return assignment as Assignment;
      },
      async update(assignment, user, status, data) {
        Object.assign(assignment, data);
        if (user) {
          assignment.user = user;
        }
        if (status) {
          assignment.status;
        }
        return assignment;
      },
      async remove(assignment) {
        return assignment as Assignment;
      },
    };

    statusService = {
      async findOneByCode(code, ...relations) {
        return status as Status;
      },
    };

    tasksService = {
      async findOneById(id, ...relations) {
        return task as Task;
      },
    };

    usersService = {
      async findOneById(id, ...relations) {
        return user as User;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsResolver,
        {
          provide: AssignmentsService,
          useValue: assignmentsService,
        },
        {
          provide: StatusService,
          useValue: statusService,
        },
        {
          provide: TasksService,
          useValue: tasksService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    resolver = module.get<AssignmentsResolver>(AssignmentsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should create a new one', async () => {
    const data: Partial<NewAssignmentInput> = {
      ...assignment,
      taskId: '1',
      userId: '1',
    };

    expect(
      await resolver.createAssignment(
        data as NewAssignmentInput,
        currentUser as UserModel,
      ),
    ).toEqual(assignment);
  });

  it('should resolve one by ID', async () => {
    expect(await resolver.assignment('1')).toEqual(assignment);
  });

  it('should resolve all', async () => {
    expect(await resolver.assignments({} as AssignmentsFindArgs)).toEqual({
      result: [assignment as Assignment],
      total: 1,
    });
  });

  it('should update one', async () => {
    const updateData: UpdateAssignmentInput = {
      title: 'This title is updated',
    };
    expect(await resolver.updateAssignment('1', updateData)).toEqual({
      ...assignment,
      ...updateData,
    });
  });

  it('should remove one', async () => {
    expect(await resolver.removeAssignment('1')).toEqual(assignment);
  });
});
