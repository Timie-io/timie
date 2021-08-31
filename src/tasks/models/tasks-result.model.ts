import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Task } from './task.model';

@ObjectType()
export class TasksResult {
  @Field((type) => [Task])
  result: Task[];

  @Field((type) => Int)
  total: number;
}
