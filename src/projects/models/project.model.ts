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

  @Field()
  creationDate: Date;

  @Field((type) => User)
  owner: User;

  @Field((type) => Team, { nullable: true })
  team: Team;

  @Field({ defaultValue: true })
  active: boolean;
}
