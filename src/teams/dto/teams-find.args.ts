import { ArgsType, Field, ID } from '@nestjs/graphql';
import { FindArgs } from '../../shared/dto/find.args';

@ArgsType()
export class TeamsFindArgs extends FindArgs {
  @Field({ nullable: true })
  name: string;

  @Field((type) => ID, { nullable: true })
  ownerId: string;
}
