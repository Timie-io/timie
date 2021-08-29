import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Project } from './project.model';

@ObjectType()
export class ProjectsResult {
  @Field((type) => [Project])
  result: Project[];

  @Field((type) => Int)
  total: number;
}
