import { Connection, ViewColumn, ViewEntity } from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { Entry } from './entry.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('entry.id', 'id')
      .addSelect('entry."startTime"', 'startTime')
      .addSelect('entry."finishTime"', 'finishTime')
      .addSelect('entry.note', 'note')
      .addSelect('user.id', 'userId')
      .addSelect('user.name', 'userName')
      .addSelect('assignment.id', 'assignmentId')
      .addSelect('assignment.note', 'assignmentNote')
      .addSelect('task.id', 'taskId')
      .addSelect('task.title', 'taskTitle')
      .addSelect(
        '(extract(epoch from (entry."finishTime" - entry."startTime")) * 1000)::int',
        'totalTime',
      )
      .from(Entry, 'entry')
      .innerJoin(User, 'user', 'user.id = entry.userId')
      .leftJoin(Assignment, 'assignment', 'assignment.id = entry.assignmentId')
      .leftJoin(Task, 'task', 'task.id = assignment.taskId'),
})
export class EntryView {
  @ViewColumn()
  id: number;

  @ViewColumn()
  startTime: Date;

  @ViewColumn()
  finishTime: Date;

  @ViewColumn()
  note: string;

  @ViewColumn()
  userId: number;

  @ViewColumn()
  userName: string;

  @ViewColumn()
  assignmentId: number;

  @ViewColumn()
  assignmentNote: string;

  @ViewColumn()
  taskId: number;

  @ViewColumn()
  taskTitle: string;

  @ViewColumn()
  totalTime: number;
}
