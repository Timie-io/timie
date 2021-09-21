import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class EntryChangedInput {
  @Field((type) => ID, { nullable: true })
  userId: string;

  @Field((type) => ID, { nullable: true })
  assignmentId: string;
}
