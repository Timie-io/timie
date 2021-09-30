import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { TasksFindArgs } from './dto/tasks-find.args';
import { Task } from './task.entity';

const sortableFields = {
  title: 'task.title',
  created: 'task.creationDate',
  lastModified: 'task.lastModified',
  priority: 'task.Priority',
};

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
    let query = this.repository.createQueryBuilder('task');
    if (args.title) {
      query = query.andWhere('task.title ilike :title', {
        title: `%${args.title}%`,
      });
    }
    if (args.active !== undefined) {
      query = query.andWhere('task.active = :active', { active: args.active });
    }
    if (args.projectId) {
      query = query.andWhere('task.project = :projectId', {
        projectId: Number(args.projectId),
      });
    }
    if (args.followerIds && args.followerIds.length > 0) {
      query = query.innerJoin(
        'task.followers',
        'follower',
        'follower.id IN (:...followerIds)',
        { followerIds: args.followerIds.map((f) => Number(f)) },
      );
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
          query = query.addOrderBy(
            sortableFields[sort.columnName],
            sort.sortType,
          );
        }
      }
    } else {
      query = query.orderBy('task.priority', 'DESC');
      query = query.addOrderBy('task.creationDate', 'DESC');
      query = query.addOrderBy('task.lastModified', 'DESC');
    }

    const total = await query.getCount();
    const result = await query.getMany();
    return [result, total];
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
