import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class AssignmentAddedInput {
  @Field((type) => ID, { nullable: true })
  userId: string;

  @Field((type) => ID, { nullable: true })
  taskId: string;
}
