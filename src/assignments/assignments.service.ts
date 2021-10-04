import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Status } from '../status/status.entity';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { AssignmentView } from './assignment-view.entity';
import { Assignment } from './assignment.entity';
import { AssignmentsFindArgs } from './dto/assignments-find.args';
import { AssignmentsViewArgs } from './dto/assignments-view.args';

const sortableFields = {
  note: 'assignment.note',
  deadline: 'assignment.deadline',
  created: 'assignment.created',
  creator: 'assignment."creatorName"',
  user: 'assignment."userName"',
  task: 'assignment."taskTitle"',
  project: 'assignment."projectName"',
  status: 'assignment."statusLabel"',
  time: 'assignment."totalTime"',
};

const sortableOptions = {
  deadline: 'NULLS LAST',
  time: 'NULLS LAST',
};

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly repository: Repository<Assignment>,
    @InjectRepository(AssignmentView)
    private readonly assignmentsView: Repository<AssignmentView>,
  ) {}

  async findOneById(id: number, ...relations): Promise<Assignment | undefined> {
    return await this.repository.findOne(id, { relations });
  }

  async findView(
    args: AssignmentsViewArgs,
  ): Promise<[AssignmentView[], number]> {
    let query = this.assignmentsView.createQueryBuilder('assignment');
    if (args.search) {
      query.where(
        new Brackets((qb) => {
          qb.where('assignment.note ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('assignment."creatorName" ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('assignment."userName" ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('assignment."taskTitle" ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('assignment."projectName" ilike :search', {
            search: `%${args.search}%`,
          });
        }),
      );
    }
    if (args.creatorId) {
      query.andWhere('assignment."creatorId" = :creatorId', {
        creatorId: args.creatorId,
      });
    }
    if (args.userId) {
      query.andWhere('assignment."userId" = :userId', {
        userId: args.userId,
      });
    }
    if (args.taskId) {
      query.andWhere('assignment."taskId" = :taskId', {
        taskId: args.taskId,
      });
    }
    if (args.projectId) {
      query.andWhere('assignment."projectId" = :projectId', {
        projectId: args.projectId,
      });
    }
    if (args.statusCode) {
      query.andWhere('assignment."statusCode" = :statusCode', {
        statusCode: args.statusCode,
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
          query.addOrderBy(
            sortableFields[sort.columnName],
            sort.sortType,
            sortableOptions[sort.columnName],
          );
        }
      }
    } else {
      query.orderBy('assignment.deadline', 'DESC', 'NULLS LAST');
      query.addOrderBy('assignment."created"', 'DESC');
    }

    const total = await query.getCount();
    const result = await query.getMany();
    return [result, total];
  }

  async findAll(
    args: AssignmentsFindArgs,
    ...relations: string[]
  ): Promise<[Assignment[], number]> {
    let query = this.repository.createQueryBuilder('assignment');
    if (args.userId) {
      query.andWhere('assignment.userId = :userId', {
        userId: args.userId,
      });
    }
    if (args.taskId) {
      query.andWhere('assignment.taskId = :taskId', {
        taskId: args.taskId,
      });
    }
    if (args.statusCode) {
      query.andWhere('assignment.statusCode = :statusCode', {
        statusCode: args.statusCode,
      });
    }
    if (args.skip) {
      query.skip(args.skip);
    }
    if (args.take) {
      query.take(args.take);
    }
    query.orderBy('assignment.deadline', 'DESC', 'NULLS LAST');
    query.addOrderBy('assignment.creationDate', 'DESC');

    const total = await query.getCount();
    const result = await query.getMany();
    return [result, total];
  }

  async create(
    data: Partial<Assignment>,
    task: Task,
    user: User,
    creator: User,
    status: Status,
  ): Promise<Assignment> {
    const assignment = this.repository.create(data);
    assignment.task = task;
    assignment.user = user;
    assignment.creator = creator;
    assignment.status = status;
    return await this.repository.save(assignment);
  }

  async update(
    assignment: Assignment,
    user: User,
    status: Status,
    data: Partial<Assignment>,
  ): Promise<Assignment> {
    Object.assign(assignment, data);
    if (user) {
      assignment.user = user;
    }
    if (status) {
      assignment.status = status;
    }
    return await this.repository.save(assignment);
  }

  async remove(assignment: Assignment) {
    return await this.repository.remove(assignment);
  }
}
