import { ArgsType, Field, ID } from '@nestjs/graphql';
import { FindArgs } from '../../shared/dto/find.args';

@ArgsType()
export class ProjectsFindArgs extends FindArgs {
  @Field({ nullable: true })
  name: string;

  @Field((type) => ID, { nullable: true })
  ownerId: string;

  @Field((type) => ID, { nullable: true })
  teamId: string;
}
