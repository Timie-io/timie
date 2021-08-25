/**
 * User entity
 */

import { Team } from 'src/teams/team.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @ManyToMany(() => Team)
  teams: Team[];
}
