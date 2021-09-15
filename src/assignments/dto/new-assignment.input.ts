import { Field, ID, InputType } from '@nestjs/graphql';
import { Length } from 'class-validator';

@InputType()
export class NewAssignmentInput {
  @Field((type) => ID)
  taskId: string;

  @Field({ nullable: true })
  @Length(1, 500)
  note: string;

  @Field({ nullable: true })
  deadline: Date;

  @Field((type) => ID, { nullable: true })
  userId: string;

  @Field((type) => ID, { nullable: true })
  statusCode: string;
}
