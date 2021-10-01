import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ProjectView } from './project-view.model';

@ObjectType()
export class ProjectsViewResult {
  @Field((type) => [ProjectView])
  result: ProjectView[];

  @Field((type) => Int)
  total: number;
}
