import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, FindManyOptions, ILike, Repository } from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';
import { User } from '../users/user.entity';
import { EntriesFindArgs } from './dto/entries-find.args';
import { EntriesViewArgs } from './dto/entries-view.args';
import { EntryView } from './entry-view.entity';
import { Entry } from './entry.entity';

const sortableFields = {
  startTime: 'entries."startTime"',
  finishTime: 'entries."finishTime"',
  note: 'entries.note',
  user: 'entries."userName"',
  assignment: 'entries."assignmentNote"',
  task: 'entries."taskTitle"',
  project: 'entries."projectId"',
  totalTime: 'entries."totalTime"',
};

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(Entry) private readonly repository: Repository<Entry>,
    @InjectRepository(EntryView)
    private readonly entriesView: Repository<EntryView>,
  ) {}

  async findOneById(
    id: number,
    ...relations: string[]
  ): Promise<Entry | undefined> {
    return await this.repository.findOne(id, { relations });
  }

  async findView(
    args: EntriesViewArgs,
  ): Promise<[EntryView[], number, number]> {
    const query = this.entriesView.createQueryBuilder('entries');
    if (args.search) {
      query.where(
        new Brackets((qb) => {
          qb.where('entries.note ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('entries."userName" ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('entries."assignmentNote" ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('entries."taskTitle" ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('entries."projectName" ilike :search', {
            search: `%${args.search}%`,
          });
        }),
      );
    }
    if (args.userId) {
      query.andWhere('entries."userId" = :userId', { userId: args.userId });
    }
    if (args.assignmentId) {
      query.andWhere('entries."assignmentId" = :assignmentId', {
        assignmentId: args.assignmentId,
      });
    }
    if (args.taskId) {
      query.andWhere('entries."taskId" = :taskId', { taskId: args.taskId });
    }
    if (args.projectId) {
      query.andWhere('entries."projectId" = :projectId', {
        projectId: args.projectId,
      });
    }
    if (args.skip) {
      query.skip(args.skip);
    }
    if (args.take) {
      query.take(args.take);
    }
    if (args.sortBy) {
      for (let sort of args.sortBy) {
        if (sort.columnName in sortableFields) {
          query.addOrderBy(sortableFields[sort.columnName], sort.sortType);
        }
      }
    } else {
      query.orderBy('entries.id', 'DESC');
    }

    const total = await query.getCount();
    const result = await query.getMany();

    const totalQuery = query
      .select('sum(entries."totalTime")', 'total')
      .orderBy();

    const totalTime = await totalQuery.getRawOne<{ total: number }>();

    return [result, total, totalTime.total];
  }

  async findAll(
    args: EntriesFindArgs,
    ...relations: string[]
  ): Promise<[Entry[], number, number]> {
    const filter = {
      where: {},
      skip: args.skip,
      take: args.take,
      order: {
        id: 'DESC',
      },
      relations,
    } as FindManyOptions;
    if (args.note) {
      Object.assign(filter.where, { note: ILike(`%${args.note}%`) });
    }
    if (args.userId) {
      Object.assign(filter.where, { userId: Number(args.userId) });
    }
    if (args.assignmentId) {
      Object.assign(filter.where, { assignmentId: Number(args.assignmentId) });
    }

    let totalTime = 0;
    const [result, total] = await this.repository.findAndCount(filter);
    if (total > 0) {
      for (let entry of result) {
        if (entry.startTime && entry.finishTime) {
          totalTime += Number(entry.finishTime) - Number(entry.startTime);
        }
      }
    }
    return [result, total, totalTime];
  }

  async create(
    data: Partial<Entry>,
    user: User,
    assignment?: Assignment,
  ): Promise<Entry> {
    const entry = this.repository.create(data);
    entry.user = user;
    if (assignment) {
      entry.assignment = assignment;
    }
    return this.repository.save(entry);
  }

  async update(entry: Entry, data: Partial<Entry>): Promise<Entry> {
    Object.assign(entry, data);
    return await this.repository.save(entry);
  }

  async remove(entry: Entry): Promise<Entry> {
    return await this.repository.remove(entry);
  }

  async start(entry: Entry): Promise<Entry> {
    if (entry.startTime) {
      throw new ConflictException('the entry is already started');
    }
    entry.startTime = new Date();
    return await this.repository.save(entry);
  }

  async stop(entry: Entry): Promise<Entry> {
    if (entry.finishTime) {
      throw new ConflictException('the entry is already stopped');
    }
    entry.finishTime = new Date();
    return await this.repository.save(entry);
  }
}
