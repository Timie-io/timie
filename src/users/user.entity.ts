import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';
import { Comment } from '../comments/comment.entity';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';
import { Team } from '../teams/team.entity';
import { Entry } from './../entries/entry.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: () => 'now()' })
  creationDate: Date;

  @OneToMany(() => Team, (team) => team.owner)
  ownedTeams: Team[];

  @ManyToMany(() => Team, (team) => team.members)
  teams: Team[];

  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];

  @ManyToMany(() => Task, (task) => task.followers)
  tasks: Task[];

  @OneToMany(() => Task, (task) => task.creator)
  myTasks: Task[];

  @OneToMany(() => Assignment, (assignment) => assignment.user)
  assignments: Assignment[];

  @OneToMany(() => Assignment, (assignment) => assignment.creator)
  myAssignments: Assignment[];

  @OneToMany(() => Entry, (entry) => entry.user)
  entries: Entry[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}
