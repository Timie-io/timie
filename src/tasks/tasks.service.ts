import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { TasksFindArgs } from './dto/tasks-find.args';
import { TasksViewArgs } from './dto/tasks-view.args';
import { TaskView } from './task-view.entity';
import { Task } from './task.entity';

const sortableFields = {
  title: 'task.title',
  project: 'task.projectName',
  created: 'task.created',
  creator: 'task.creatorName',
  modified: 'task.modified',
  priority: 'task.priority',
};

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly repository: Repository<Task>,
    @InjectRepository(TaskView)
    private readonly tasksView: Repository<TaskView>,
  ) {}

  async findOneById(
    id: number,
    ...relations: string[]
  ): Promise<Task | undefined> {
    const query = { id: id };
    return await this.repository.findOne(query, { relations });
  }

  async findView(args: TasksViewArgs): Promise<[TaskView[], number]> {
    let query = this.tasksView.createQueryBuilder('task');
    if (args.search) {
      query.where(
        new Brackets((qb) => {
          qb.where('task.title ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('task.projectName ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('task.creatorName ilike :search', {
            search: `%${args.search}%`,
          });
        }),
      );
    }
    if (args.active !== undefined) {
      query.andWhere('task.active = :active', { active: args.active });
    }
    if (args.projectId) {
      query.andWhere('task.projectId = :projectId', {
        projectId: Number(args.projectId),
      });
    }
    if (args.followerIds && args.followerIds.length > 0) {
      query.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('followed.id')
          .from(Task, 'followed')
          .innerJoin(
            'followed.followers',
            'follower',
            'follower.id IN (:...followerIds)',
            { followerIds: args.followerIds.map((f) => Number(f)) },
          )
          .getQuery();
        return 'task.id IN ' + subQuery;
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
      query.orderBy('task.priority', 'DESC');
      query.addOrderBy('task.created', 'DESC');
      query.addOrderBy('task.modified', 'DESC');
    }

    const total = await query.getCount();
    const result = await query.getMany();
    return [result, total];
  }

  async findAll(args: TasksFindArgs): Promise<[Task[], number]> {
    let query = this.repository.createQueryBuilder('task');
    if (args.title) {
      query.andWhere('task.title ilike :title', {
        title: `%${args.title}%`,
      });
    }
    if (args.active !== undefined) {
      query.andWhere('task.active = :active', { active: args.active });
    }
    if (args.projectId) {
      query.andWhere('task.project = :projectId', {
        projectId: Number(args.projectId),
      });
    }
    if (args.followerIds && args.followerIds.length > 0) {
      query.innerJoin(
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

    query.orderBy('task.priority', 'DESC');
    query.addOrderBy('task.creationDate', 'DESC');
    query.addOrderBy('task.lastModified', 'DESC');

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
