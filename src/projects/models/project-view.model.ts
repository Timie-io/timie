import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProjectView {
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

  @Field((type) => ID, { nullable: true })
  teamId: string;

  @Field({ nullable: true })
  teamName: string;

  @Field()
  created: Date;

  @Field()
  active: boolean;
}
