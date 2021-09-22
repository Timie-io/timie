import { Field, InputType } from '@nestjs/graphql';
import { MinLength } from 'class-validator';

@InputType()
export class NewCommentInput {
  @Field()
  @MinLength(1)
  body: string;
}
