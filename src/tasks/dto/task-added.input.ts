import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class TaskAddedInput {
  @Field((type) => ID, { nullable: true })
  projectId: string;
}
