/**
 * User entity
 */

import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';
import { Team } from '../teams/team.entity';

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
}
