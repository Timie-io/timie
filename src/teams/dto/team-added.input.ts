import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class TeamAddedInput {
  @Field((type) => ID, { nullable: true })
  ownerId: string;
}
