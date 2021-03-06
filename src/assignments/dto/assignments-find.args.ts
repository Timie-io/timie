import { ArgsType, Field, ID } from '@nestjs/graphql';
import { FindArgs } from '../../shared/dto/find.args';

@ArgsType()
export class AssignmentsFindArgs extends FindArgs {
  @Field((type) => ID, { nullable: true })
  userId: string;

  @Field((type) => ID, { nullable: true })
  taskId: string;

  @Field((type) => ID, { nullable: true })
  statusCode: string;

  @Field({ nullable: true })
  active: boolean;
}
