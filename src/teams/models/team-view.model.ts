import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TeamView {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field((type) => ID)
  ownerId: string;

  @Field()
  ownerName: string;
}
