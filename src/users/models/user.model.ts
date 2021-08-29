import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Team } from '../../teams/models/team.model';

@ObjectType()
export class User {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  creationDate: Date;

  @Field()
  password: string;

  @Field({ defaultValue: false })
  isAdmin: boolean;

  @Field((type) => [Team], { nullable: true })
  ownedTeams: Team[];

  @Field((type) => [Team], { nullable: true })
  teams: Team[];
}
