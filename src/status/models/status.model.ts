import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Assignment } from '../../assignments/models/assignment.model';

@ObjectType()
export class Status {
  @Field((type) => ID)
  code: string;

  @Field()
  label: string;

  @Field()
  order: number;

  @Field((type) => [Assignment])
  assignments: Assignment[];
}
