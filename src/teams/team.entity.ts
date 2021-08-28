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
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.ownedTeams)
  owner: User;

  @ManyToMany(() => User, (user) => user.teams)
  @JoinTable()
  members: User[];

  @ManyToMany(() => Project, (project) => project.teams)
  projects: Project[];
}
