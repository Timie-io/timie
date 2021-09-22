import { ArgsType, Field, ID } from '@nestjs/graphql';
import { FindArgs } from './../../shared/dto/find.args';

@ArgsType()
export class CommentsFindArgs extends FindArgs {
  @Field((type) => ID, { nullable: true })
  taskId: string;

  @Field((type) => ID, { nullable: true })
  userId: string;
}
