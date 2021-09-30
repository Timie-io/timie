import { ArgsType, Field, ID } from '@nestjs/graphql';
import { FindArgs } from '../../shared/dto/find.args';
import { SortInput } from './../../shared/dto/sort-type.input';

@ArgsType()
export class TasksFindArgs extends FindArgs {
  @Field({ nullable: true })
  title: string;

  @Field((type) => ID, { nullable: true })
  projectId: string;

  @Field({ nullable: true })
  active: boolean;

  @Field((type) => [ID], { nullable: true })
  followerIds: string[];

  @Field((type) => [SortInput], { nullable: 'itemsAndList' })
  sortBy: SortInput[];
}
