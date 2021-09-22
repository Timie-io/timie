import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';
import { User } from '../users/user.entity';
import { EntriesFindArgs } from './dto/entries-find.args';
import { Entry } from './entry.entity';

@Injectable()
export class EntriesService {
  constructor(
    @InjectRepository(Entry) private readonly repository: Repository<Entry>,
  ) {}

  async findOneById(
    id: number,
    ...relations: string[]
  ): Promise<Entry | undefined> {
    return await this.repository.findOne(id, { relations });
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
