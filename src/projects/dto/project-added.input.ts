import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class ProjectAddedInput {
  @Field((type) => ID, { nullable: true })
  ownerId: string;

  @Field((type) => ID, { nullable: true })
  teamId: string;
}
