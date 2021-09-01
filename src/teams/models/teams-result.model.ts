import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Team } from './team.model';

@ObjectType()
export class TeamsResult {
  @Field((type) => [Team])
  result: Team[];

  @Field((type) => Int)
  total: number;
}
