/**
 * User entity
 */

import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToMany(() => Team, (team) => team.members)
  teams: Team[];
}
