import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  priority: number;

  @Column({ default: () => 'now()' })
  creationDate: Date;

  @ManyToMany(() => User, (user) => user.tasks)
  @JoinTable()
  followers: User[];

  @ManyToOne(() => User, (user) => user.myTasks)
  creator: User;

  @ManyToOne(() => Project, (project) => project.tasks)
  project: Project;

  @Column({ default: true })
  active: boolean;

  @Column()
  projectId: number;
}
