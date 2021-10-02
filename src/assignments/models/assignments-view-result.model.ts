import { Field, Int, ObjectType } from '@nestjs/graphql';
import { AssignmentView } from './assignment-view.model';

@ObjectType()
export class AssignmentsViewResult {
  @Field((type) => [AssignmentView])
  result: AssignmentView[];

  @Field((type) => Int)
  total: number;
}
