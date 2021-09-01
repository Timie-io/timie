import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';

@Entity()
export class Status {
  @PrimaryColumn()
  code: string;

  @Column({ unique: true })
  order: number;

  @Column({ unique: true })
  label: string;

  @OneToMany(() => Assignment, (assignment) => assignment.status)
  assignments: Assignment[];
}
