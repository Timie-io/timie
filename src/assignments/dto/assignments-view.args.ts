import { ArgsType, Field, ID } from '@nestjs/graphql';
import { FindArgs } from '../../shared/dto/find.args';
import { SortInput } from '../../shared/dto/sort-type.input';

@ArgsType()
export class AssignmentsViewArgs extends FindArgs {
  @Field({ nullable: true })
  search: string;

  @Field((type) => ID, { nullable: true })
  creatorId: string;

  @Field((type) => ID, { nullable: true })
  userId: string;

  @Field((type) => ID, { nullable: true })
  taskId: string;

  @Field((type) => ID, { nullable: true })
  projectId: string;

  @Field((type) => ID, { nullable: true })
  statusCode: string;

  @Field((type) => [SortInput], { nullable: 'itemsAndList' })
  sortBy: SortInput[];
}
