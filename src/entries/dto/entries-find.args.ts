import { ArgsType, Field, ID } from '@nestjs/graphql';
import { FindArgs } from '../../shared/dto/find.args';

@ArgsType()
export class EntriesFindArgs extends FindArgs {
  @Field((type) => ID, { nullable: true })
  assignmentId: string;
}
