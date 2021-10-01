import { ArgsType, Field, ID } from '@nestjs/graphql';
import { FindArgs } from '../../shared/dto/find.args';
import { SortInput } from '../../shared/dto/sort-type.input';

@ArgsType()
export class ProjectsViewArgs extends FindArgs {
  @Field({ nullable: true })
  search: string;

  @Field({ nullable: true })
  active: boolean;

  @Field((type) => ID, { nullable: true })
  ownerId: string;

  @Field((type) => ID, { nullable: true })
  teamId: string;

  @Field((type) => [SortInput], { nullable: 'itemsAndList' })
  sortBy: SortInput[];
}
