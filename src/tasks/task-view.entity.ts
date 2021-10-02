import { Connection, ViewColumn, ViewEntity } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { Task } from './task.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('task.id', 'id')
      .addSelect('task.title', 'title')
      .addSelect('task.description', 'description')
      .addSelect('task.projectId', 'projectId')
      .addSelect('project.name', 'projectName')
      .addSelect('task.active', 'active')
      .addSelect('task.creationDate', 'created')
      .addSelect('task.creatorId', 'creatorId')
      .addSelect('user.name', 'creatorName')
      .addSelect('task.lastModified', 'modified')
      .addSelect('task.priority', 'priority')
      .from(Task, 'task')
      .leftJoin(Project, 'project', 'project.id = task.projectId')
      .leftJoin(User, 'user', 'user.id = task.creatorId'),
})
export class TaskView {
  @ViewColumn()
  id: number;

  @ViewColumn()
  title: string;

  @ViewColumn()
  description: string;

  @ViewColumn()
  projectId: number;

  @ViewColumn()
  projectName: string;

  @ViewColumn()
  active: boolean;

  @ViewColumn()
  created: Date;

  @ViewColumn()
  creatorId: number;

  @ViewColumn()
  creatorName: string;

  @ViewColumn()
  modified: Date;

  @ViewColumn()
  priority: number;
}
