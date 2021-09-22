import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CommentAddedInput {
  @Field((type) => ID, { nullable: true })
  taskId: string;
}
