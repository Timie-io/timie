import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Assignment } from '../assignments/assignment.entity';

@Entity()
export class Entry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  startTime: Date;

  @Column({ nullable: true })
  finishTime: Date;

  @ManyToOne(() => Assignment, (assignment) => assignment.entries)
  assignment: Assignment;

  @Column()
  assignmentId: number;
}
