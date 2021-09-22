import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class NewEntryInput {
  @Field({ nullable: true })
  startTime: Date;

  @Field({ nullable: true })
  finishTime: Date;

  @Field({ nullable: true })
  note: string;

  @Field((type) => ID)
  userId: string;

  @Field((type) => ID, { nullable: true })
  assignmentId: string;
}
