import { ArgsType, Field, ID } from '@nestjs/graphql';
import { FindArgs } from '../../shared/dto/find.args';

@ArgsType()
export class TeamsViewArgs extends FindArgs {
  @Field({ nullable: true })
  search: string;

  @Field((type) => ID, { nullable: true })
  ownerId: string;
}
