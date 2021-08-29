import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Team } from '../../teams/models/team.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Project {
  @Field((type) => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field((type) => User)
  owner: User;

  @Field((type) => Team)
  team: Team;
}
