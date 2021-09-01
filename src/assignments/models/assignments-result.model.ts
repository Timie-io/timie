import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Assignment } from './assignment.model';

@ObjectType()
export class AssignmentsResult {
  @Field((type) => [Assignment])
  result: Assignment[];

  @Field((type) => Int)
  total: number;
}
