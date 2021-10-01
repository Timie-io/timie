import { Field, Int, ObjectType } from '@nestjs/graphql';
import { TeamView } from './team-view.model';

@ObjectType()
export class TeamsViewResult {
  @Field((type) => [TeamView])
  result: TeamView[];

  @Field((type) => Int)
  total: number;
}
