import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EntryView {
  @Field((type) => ID)
  id: string;

  @Field()
  startTime: Date;

  @Field({ nullable: true })
  finishTime: Date;

  @Field({ nullable: true })
  note: string;

  @Field((type) => ID)
  userId: string;

  @Field()
  userName: string;

  @Field((type) => ID, { nullable: true })
  assignmentId: string;

  @Field({ nullable: true })
  assignmentNote: string;

  @Field((type) => ID, { nullable: true })
  taskId: string;

  @Field({ nullable: true })
  taskTitle: string;

  @Field({ nullable: true })
  projectId: string;

  @Field({ nullable: true })
  projectName: string;

  @Field({ nullable: true })
  totalTime: number;
}
