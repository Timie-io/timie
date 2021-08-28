import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from '../teams/team.entity';

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

  @ManyToOne(() => Team, (team) => team.ownedProjects)
  owner: Team;

  @ManyToMany(() => Team, (team) => team.projects)
  @JoinTable()
  teams: Team[];
}
