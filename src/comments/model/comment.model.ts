import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Task } from '../../tasks/models/task.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Comment {
  @Field((type) => ID)
  id: string;

  @Field((type) => Task)
  task: Task;

  @Field((type) => User)
  user: User;

  @Field()
  creationDate: Date;

  @Field()
  body: string;
}
