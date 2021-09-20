import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entry } from '../../entries/models/entry.model';
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

  @Field({ nullable: true })
  note: string;

  @Field((type) => Status, { nullable: true })
  status: Status;

  @Field((type) => [Entry], { nullable: 'itemsAndList' })
  entries: Entry[];

  @Field({ nullable: true })
  totalTime: number;
}
