import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Status } from '../status/status.entity';
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
      Object.assign(filter.where, { userId: args.userId });
    }
    if (args.taskId) {
      Object.assign(filter.where, { taskId: args.taskId });
    }
    if (args.title) {
      Object.assign(filter.where, { title: ILike(`%${args.title}%`) });
    }
    return await this.repository.findAndCount(filter);
  }

  async create(
    data: Partial<Assignment>,
    user: User,
    creator: User,
    status: Status,
  ): Promise<Assignment> {
    const assignment = this.repository.create(data);
    assignment.user = user;
    assignment.creator = creator;
    assignment.status = status;
    return await this.repository.save(assignment);
  }

  async update(
    assignment: Assignment,
    user: User,
    data: Partial<Assignment>,
  ): Promise<Assignment> {
    Object.assign(assignment, data);
    if (user) {
      assignment.user = user;
    }
    return await this.repository.save(assignment);
  }

  async remove(assignment: Assignment) {
    return await this.repository.remove(assignment);
  }
}
