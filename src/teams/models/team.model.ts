import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Project } from '../../projects/models/project.model';
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

  @Field((type) => [Project], { nullable: true })
  ownedProjects: Project[];

  @Field((type) => [Project], { nullable: true })
  projects: Project[];
}
