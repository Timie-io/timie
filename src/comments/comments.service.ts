import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { Comment } from './comment.entity';
import { CommentsFindArgs } from './dto/comments-find.args';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly repository: Repository<Comment>,
  ) {}

  async create(
    data: Partial<Comment>,
    task: Task,
    user: User,
  ): Promise<Comment> {
    const comment = this.repository.create(data);
    comment.task = task;
    comment.user = user;
    return await this.repository.save(comment);
  }

  async update(comment: Comment, data: Partial<Comment>): Promise<Comment> {
    Object.assign(comment, data);
    return await this.repository.save(comment);
  }

  async remove(comment: Comment): Promise<Comment> {
    return await this.repository.remove(comment);
  }

  async findAll(
    args: CommentsFindArgs,
    ...relations: string[]
  ): Promise<[Comment[], number]> {
    const filter = {
      where: {},
      skip: args.skip,
      take: args.take,
      order: {
        id: 'DESC',
      },
      relations,
    } as FindManyOptions;
    if (args.taskId) {
      Object.assign(filter.where, { taskId: Number(args.taskId) });
    }
    if (args.userId) {
      Object.assign(filter.where, { userId: Number(args.userId) });
    }
    return await this.repository.findAndCount(filter);
  }

  async findOneById(
    id: number,
    ...relations: string[]
  ): Promise<Comment | undefined> {
    const query = { id: id };
    return await this.repository.findOne(query, { relations });
  }
}
