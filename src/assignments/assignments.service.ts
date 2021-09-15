import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from '../status/status.entity';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { Assignment } from './assignment.entity';
import { AssignmentsFindArgs } from './dto/assignments-find.args';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly repository: Repository<Assignment>,
  ) {}

  async findOneById(id: number, ...relations): Promise<Assignment | undefined> {
    return await this.repository.findOne(id, { relations });
  }

  async findAll(
    args: AssignmentsFindArgs,
    ...relations: string[]
  ): Promise<[Assignment[], number]> {
    const filter = {
      where: {},
      skip: args.skip,
      take: args.take,
      relations,
    };
    if (args.userId) {
      Object.assign(filter.where, { userId: Number(args.userId) });
    }
    if (args.taskId) {
      Object.assign(filter.where, { taskId: Number(args.taskId) });
    }
    return await this.repository.findAndCount(filter);
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
