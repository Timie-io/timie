import { ArgsType, Field, ID } from '@nestjs/graphql';
import { FindArgs } from '../../shared/dto/find.args';

@ArgsType()
export class TaskFindArgs extends FindArgs {
  @Field({ nullable: true })
  title: string;

  @Field((type) => ID, { nullable: true })
  projectId: string;

  @Field({ nullable: true })
  active: boolean;
}
