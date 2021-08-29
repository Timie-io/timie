import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToOne(() => User, (user) => user.projects)
  owner: User;

  @ManyToOne(() => Team, (team) => team.projects, { nullable: true })
  team: Team;
}
