import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Assignment } from '../../assignments/models/assignment.model';

@ObjectType()
export class Entry {
  @Field((type) => ID)
  id: string;

  @Field({ nullable: true })
  startTime: Date;

  @Field({ nullable: true })
  finishTime: Date;

  @Field((type) => Assignment)
  assignment: Assignment;
}