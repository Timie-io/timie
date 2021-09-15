import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';
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

  @Column({ nullable: true })
  lastModified: Date;

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

  @OneToMany(() => Assignment, (assignment) => assignment.task)
  assignments: Assignment[];
}
