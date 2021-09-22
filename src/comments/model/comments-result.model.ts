import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Comment } from './comment.model';

@ObjectType()
export class CommentsResult {
  @Field((type) => [Comment])
  result: Comment[];

  @Field((type) => Int)
  total: number;
}
