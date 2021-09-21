import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';
import { User } from './../users/user.entity';

@Entity()
export class Entry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  startTime: Date;

  @Column({ nullable: true })
  finishTime: Date;

  @ManyToOne(() => User, (user) => user.entries)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.entries, {
    nullable: true,
  })
  assignment: Assignment;

  @Column({ nullable: true })
  assignmentId: number;
}
