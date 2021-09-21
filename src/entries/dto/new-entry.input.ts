import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class NewEntryInput {
  @Field({ nullable: true })
  startTime: Date;

  @Field({ nullable: true })
  finishTime: Date;

  @Field((type) => ID)
  userId: string;

  @Field((type) => ID, { nullable: true })
  assignmentId: string;
}
