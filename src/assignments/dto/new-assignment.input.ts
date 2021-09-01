import { Field, ID, InputType } from '@nestjs/graphql';
import { Length } from 'class-validator';

@InputType()
export class NewAssignmentInput {
  @Field((type) => ID)
  taskId: string;

  @Field()
  @Length(1, 100)
  title: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  deadline: Date;

  @Field((type) => ID, { nullable: true })
  userId: string;

  @Field((type) => ID, { nullable: true })
  statusCode: string;
}
