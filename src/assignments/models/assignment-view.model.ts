import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AssignmentView {
  @Field((type) => ID)
  id: string;

  @Field((type) => ID)
  creatorId: string;

  @Field()
  creatorName: string;

  @Field()
  created: Date;

  @Field((type) => ID)
  userId: string;

  @Field()
  userName: string;

  @Field((type) => ID)
  taskId: string;

  @Field()
  taskTitle: string;

  @Field((type) => ID)
  projectId: string;

  @Field()
  projectName: string;

  @Field({ nullable: true })
  note: string;

  @Field({ nullable: true })
  deadline: Date;

  @Field((type) => ID, { nullable: true })
  statusCode: string;

  @Field({ nullable: true })
  statusLabel: string;

  @Field({ nullable: true })
  totalTime: number;
}
