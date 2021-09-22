import { Test, TestingModule } from '@nestjs/testing';
import { Assignment } from '../assignments/assignment.entity';
import { AssignmentsService } from '../assignments/assignments.service';
import { User } from '../users/user.entity';
import { UsersService } from './../users/users.service';
import { EntriesFindArgs } from './dto/entries-find.args';
import { NewEntryInput } from './dto/new-entry.input';
import { UpdateEntryInput } from './dto/update-entry.input';
import { EntriesResolver } from './entries.resolver';
import { EntriesService } from './entries.service';
import { Entry } from './entry.entity';

describe('EntriesResolver', () => {
  let resolver: EntriesResolver;
  let entriesService: Partial<EntriesService>;
  let usersService: Partial<UsersService>;
  let assignmentsService: Partial<AssignmentsService>;
  let entry: Partial<Entry>;
  let user: Partial<User>;
  let assignment: Partial<Assignment>;

  beforeEach(async () => {
    user = {
      id: 1,
      name: 'User',
      email: 'user@mail.com',
    };

    assignment = {
      id: 1,
      note: 'Assignment',
    };

    entry = {
      id: 1,
      assignment: assignment as Assignment,
    };

    entriesService = {
      async findOneById(id, ...relations) {
        return entry as Entry;
      },
      async findAll(args, ...relations) {
        return [[entry as Entry], 1, 0];
      },
      async create(data, assignment) {
        return entry as Entry;
      },
      async update(entry, data) {
        return entry as Entry;
      },
      async remove(entry) {
        return entry as Entry;
      },
      async start(entry) {
        entry.startTime = new Date();
        return entry;
      },
      async stop(entry) {
        entry.finishTime = new Date();
        return entry;
      },
    };

    assignmentsService = {
      async findOneById(id, ...relations) {
        return assignment as Assignment;
      },
    };

    usersService = {
      async findOneById(id, ...relations): Promise<User> {
        return user as User;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntriesResolver,
        {
          provide: EntriesService,
          useValue: entriesService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: AssignmentsService,
          useValue: assignmentsService,
        },
      ],
    }).compile();

    resolver = module.get<EntriesResolver>(EntriesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should resolve one by ID', async () => {
    expect(await resolver.entry('1')).toEqual(entry);
  });

  it('should resolve all', async () => {
    expect(await resolver.entries({} as EntriesFindArgs)).toEqual({
      result: [entry as Entry],
      total: 1,
      totalTime: 0,
    });
  });

  it('should create one', async () => {
    const input = { assignmentId: '1' };
    expect(await resolver.createEntry(input as NewEntryInput)).toEqual(entry);
  });

  it('should update one', async () => {
    const input = { startTime: new Date(2021, 9, 3, 11, 5) };
    expect(await resolver.updateEntry('1', input as UpdateEntryInput)).toEqual(
      entry,
    );
  });

  it('should remove one', async () => {
    expect(await resolver.removeEntry('1')).toEqual(entry);
  });

  it('should start the timer', async () => {
    entry.startTime = undefined;
    const startedEntry = await resolver.startEntry('1');
    expect(startedEntry.startTime).toBeDefined();
  });

  it('should stop the timer', async () => {
    entry.finishTime = undefined;
    const stoppedEntry = await resolver.stopEntry('1');
    expect(stoppedEntry.finishTime).toBeDefined();
  });
});
