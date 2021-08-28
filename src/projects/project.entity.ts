import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
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

  @ManyToMany(() => Team, (team) => team.projects)
  @JoinTable()
  teams: Team[];
}
