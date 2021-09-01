import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Status } from '../../status/models/status.model';
import { Task } from '../../tasks/models/task.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Assignment {
  @Field((type) => ID)
  id: string;

  @Field((type) => User)
  creator: User;

  @Field()
  creationDate: Date;

  @Field((type) => User)
  user: User;

  @Field((type) => Task)
  task: Task;

  @Field({ nullable: true })
  deadline: Date;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field((type) => Status)
  status: Status;
}
