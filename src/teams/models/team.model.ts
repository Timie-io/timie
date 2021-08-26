import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Team {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field((type) => User)
  owner: User;

  @Field((type) => [User], { nullable: true })
  members: User[];
}
