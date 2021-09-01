import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockType } from '../shared/mocks/mock.type';
import { MockRepository } from '../shared/mocks/repository.mock';
import { Status } from '../status/status.entity';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { Assignment } from './assignment.entity';
import { AssignmentsService } from './assignments.service';
import { AssignmentsFindArgs } from './dto/assignments-find.args';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let repository: MockType<Repository<Assignment>>;
  let user: Partial<User>;
  let task: Partial<Task>;
  let status: Partial<Status>;
  let assignment: Partial<Assignment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        {
          provide: getRepositoryToken(Assignment),
          useClass: MockRepository,
        },
      ],
    }).compile();

    user = {
      id: 1,
      name: 'User Name',
      email: 'user@mail.com',
    };

    task = {
      title: 'Amazing Task',
      description: 'This is an amazing task',
    };

    status = {
      code: 'O',
      label: 'Open',
      order: 1,
    };

    assignment = {
      title: 'This is a task assignment',
      user: user as User,
      task: task as Task,
      status: status as Status,
      description: 'This is the assignment description',
    };

    service = module.get<AssignmentsService>(AssignmentsService);
    repository = module.get(getRepositoryToken(Assignment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find one by ID', async () => {
    repository.findOne.mockReturnValue(assignment);
    expect(await service.findOneById(1)).toEqual(assignment);
  });

  it('should find all', async () => {
    const result = [
      assignment as Assignment,
      { ...assignment, id: 2 } as Assignment,
    ];
    repository.findAndCount.mockReturnValue([result, 2]);
    const args: Partial<AssignmentsFindArgs> = { skip: 0, take: 25 };
    expect(await service.findAll(args as AssignmentsFindArgs)).toEqual([
      result,
      2,
    ]);
  });

  it('should create one', async () => {
    repository.create.mockReturnValue(assignment);
    repository.save.mockReturnValue(assignment);
    expect(
      await service.create(
        assignment,
        user as User,
        user as User,
        status as Status,
      ),
    ).toEqual(assignment);
  });

  it('should update one', async () => {
    const newTitle = 'This Title is Updated';
    repository.save.mockReturnValue({ ...assignment, title: newTitle });
    let updatedAssignment = await service.update(
      assignment as Assignment,
      undefined,
      { title: newTitle },
    );
    expect(updatedAssignment.title).toEqual(newTitle);
    const newUser = { ...user, id: 2 };
    repository.save.mockReturnValue({ ...assignment, user: newUser });
    updatedAssignment = await service.update(
      assignment as Assignment,
      newUser as User,
      {},
    );
    expect(updatedAssignment.user).toEqual(newUser);
  });

  it('should remove one', async () => {
    repository.remove.mockReturnValue(assignment);
    expect(await service.remove(assignment as Assignment)).toEqual(assignment);
  });
});
