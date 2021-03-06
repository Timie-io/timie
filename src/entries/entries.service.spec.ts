import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';
import { MockType } from '../shared/mocks/mock.type';
import { MockRepository } from '../shared/mocks/repository.mock';
import { User } from '../users/user.entity';
import { EntriesFindArgs } from './dto/entries-find.args';
import { EntriesViewArgs } from './dto/entries-view.args';
import { EntriesService } from './entries.service';
import { EntryView } from './entry-view.entity';
import { Entry } from './entry.entity';

describe('EntriesService', () => {
  let service: EntriesService;
  let repository: MockType<Repository<Entry>>;
  let viewRepository: MockType<Repository<EntryView>>;
  let entry: Partial<Entry>;
  let entryView: Partial<EntryView>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntriesService,
        {
          provide: getRepositoryToken(Entry),
          useClass: MockRepository,
        },
        {
          provide: getRepositoryToken(EntryView),
          useClass: MockRepository,
        },
      ],
    }).compile();

    entry = {
      id: 1,
      startTime: new Date(),
      finishTime: null,
    };

    entryView = {
      id: 1,
      startTime: entry.startTime,
      finishTime: entry.finishTime,
      userName: 'User Name',
      taskTitle: 'Some Task',
    };

    service = module.get<EntriesService>(EntriesService);
    repository = module.get(getRepositoryToken(Entry));
    viewRepository = module.get(getRepositoryToken(EntryView));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find one by ID', async () => {
    repository.findOne.mockReturnValue(entry);
    expect(await service.findOneById(1)).toEqual(entry);
  });

  it('should find all', async () => {
    repository.findAndCount.mockReturnValue([[entry as Entry], 1, 0]);
    expect(await service.findAll({} as EntriesFindArgs)).toEqual([
      [entry as Entry],
      1,
      0,
    ]);
  });

  it('should get view results', async () => {
    const output = [entryView, { ...entryView, id: 2 }];
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
    const args: Partial<EntriesViewArgs> = {};
    expect(await service.findView(args as EntriesViewArgs)).toEqual([
      output,
      2,
      2,
    ]);
  });

  it('should create one', async () => {
    repository.create.mockReturnValue(entry);
    repository.save.mockReturnValue(entry);
    const assignment: Partial<Assignment> = {
      id: 1,
      note: 'Assignment',
    };
    const user: Partial<User> = {
      id: 1,
      name: 'User',
      email: 'user@mail.com',
    };
    expect(
      await service.create(entry, user as User, assignment as Assignment),
    ).toEqual(entry);
  });

  it('should remove one', async () => {
    repository.remove.mockReturnValue(entry);
    expect(await service.remove(entry as Entry)).toEqual(entry);
  });

  it('should start the timer for an entry', async () => {
    entry.startTime = undefined;
    repository.save.mockReturnValue({ ...entry, startTime: new Date() });
    const newEntry = await service.start(entry as Entry);
    expect(newEntry.startTime).toBeDefined();
  });

  it('should stop the timer for an entry', async () => {
    entry.finishTime = undefined;
    repository.save.mockReturnValue({ ...entry, finishTime: new Date() });
    const newEntry = await service.stop(entry as Entry);
    expect(newEntry.finishTime).toBeDefined();
  });
});
