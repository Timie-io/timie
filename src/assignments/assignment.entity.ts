import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Status } from '../status/status.entity';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.myAssignments)
  creator: User;

  @Column()
  creatorId: number;

  @Column({ default: () => 'now()' })
  creationDate: Date;

  @ManyToOne(() => User, (user) => user.assignments)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Task, (task) => task.assignments)
  task: Task;

  @Column()
  taskId: number;

  @Column({ nullable: true })
  deadline: Date;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => Status, (status) => status.assignments, { nullable: true })
  status: Status;

  @Column({ nullable: true })
  statusCode: string;
}
