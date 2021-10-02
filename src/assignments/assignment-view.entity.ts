import { Connection, ViewColumn, ViewEntity } from 'typeorm';
import { Entry } from '../entries/entry.entity';
import { Status } from '../status/status.entity';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { Assignment } from './assignment.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('assignment.id', 'id')
      .addSelect('assignment.note', 'note')
      .addSelect('assignment.deadline', 'deadline')
      .addSelect('assignment."creationDate"', 'created')
      .addSelect('creator.id', 'creatorId')
      .addSelect('creator.name', 'creatorName')
      .addSelect('user.id', 'userId')
      .addSelect('user.name', 'userName')
      .addSelect('task.id', 'taskId')
      .addSelect('task.title', 'taskTitle')
      .addSelect('status.code', 'statusCode')
      .addSelect('status.label', 'statusLabel')
      .addSelect('entries.total', 'totalTime')
      .from(Assignment, 'assignment')
      .leftJoin(User, 'user', 'user.id = assignment."userId"')
      .leftJoin(User, 'creator', 'creator.id = assignment."creatorId"')
      .leftJoin(Task, 'task', 'task.id = assignment."taskId"')
      .leftJoin(Status, 'status', 'status.code = assignment."statusCode"')
      .leftJoin(
        (qb) => {
          return qb
            .subQuery()
            .select('entry."assignmentId"', 'assignmentId')
            .addSelect(
              '(extract(epoch from sum(entry."finishTime" - entry."startTime")) * 1000)::int',
              'total',
            )
            .from(Entry, 'entry')
            .groupBy('entry."assignmentId"');
        },
        'entries',
        'entries."assignmentId" = assignment.id',
      ),
})
export class AssignmentView {
  @ViewColumn()
  id: number;

  @ViewColumn()
  note: string;

  @ViewColumn()
  deadline: Date;

  @ViewColumn()
  created: Date;

  @ViewColumn()
  creatorId: number;

  @ViewColumn()
  creatorName: string;

  @ViewColumn()
  userId: number;

  @ViewColumn()
  userName: string;

  @ViewColumn()
  taskId: number;

  @ViewColumn()
  taskTitle: string;

  @ViewColumn()
  statusCode: string;

  @ViewColumn()
  statusLabel: string;

  @ViewColumn()
  totalTime: number;
}
