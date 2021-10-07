import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class StatusFindArgs {
  @Field({ nullable: true })
  active: boolean;
}
