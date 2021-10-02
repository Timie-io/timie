import { Field, Int, ObjectType } from '@nestjs/graphql';
import { TaskView } from './task-view.model';

@ObjectType()
export class TasksViewResult {
  @Field((type) => [TaskView])
  result: TaskView[];

  @Field((type) => Int)
  total: number;
}
