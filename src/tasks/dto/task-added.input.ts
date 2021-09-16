import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class TaskAddedInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  active: boolean;

  @Field((type) => ID, { nullable: true })
  projectId: string;
}
