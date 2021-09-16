import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from '../tasks/task.entity';
import { Team } from '../teams/team.entity';
import { User } from '../users/user.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column({ default: () => 'now()' })
  creationDate: Date;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => User, (user) => user.projects)
  owner: User;

  @Column()
  ownerId: number;

  @ManyToOne(() => Team, (team) => team.projects, { nullable: true })
  team: Team;

  @Column({ nullable: true })
  teamId: number;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
