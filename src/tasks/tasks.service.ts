import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { TasksFindArgs } from './dto/tasks-find.args';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly repository: Repository<Task>,
  ) {}

  async findOneById(
    id: number,
    ...relations: string[]
  ): Promise<Task | undefined> {
    const query = { id: id };
    return await this.repository.findOne(query, { relations });
  }

  async findAll(
    args: TasksFindArgs,
    ...relations: string[]
  ): Promise<[Task[], number]> {
    const filter = {
      where: {},
      skip: args.skip,
      take: args.take,
      order: {
        priority: 'DESC',
        creationDate: 'DESC',
        lastModified: 'DESC',
      },
      relations,
    } as FindManyOptions;
    if (args.title) {
      Object.assign(filter.where, { title: ILike(`%${args.title}%`) });
    }
    if (args.active !== undefined) {
      Object.assign(filter.where, { active: args.active });
    }
    if (args.projectId) {
      Object.assign(filter.where, { projectId: Number(args.projectId) });
    }
    return await this.repository.findAndCount(filter);
  }

  async create(
    data: Partial<Task>,
    project: Project,
    creator: User,
  ): Promise<Task> {
    const task = this.repository.create(data);
    task.project = project;
    task.creator = creator;
    task.followers = [creator];
    return await this.repository.save(task);
  }

  async remove(task: Task): Promise<Task> {
    return await this.repository.remove(task);
  }

  async update(task: Task, data: Partial<Task>): Promise<Task> {
    Object.assign(task, data);
    task.lastModified = new Date();
    return await this.repository.save(task);
  }

  async addFollower(task: Task, user: User): Promise<Task> {
    task.followers.push(user);
    return await this.repository.save(task);
  }
  async removeFollower(task: Task, user: User): Promise<Task> {
    task.followers = task.followers.filter(
      (follower) => follower.id !== user.id,
    );
    return await this.repository.save(task);
  }
}
