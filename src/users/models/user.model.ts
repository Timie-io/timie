import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Assignment } from '../../assignments/models/assignment.model';
import { Task } from '../../tasks/models/task.model';
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

  @Field({ defaultValue: false })
  isAdmin: boolean;

  @Field((type) => [Team], { nullable: true })
  ownedTeams: Team[];

  @Field((type) => [Team], { nullable: true })
  teams: Team[];

  @Field((type) => [Task], { nullable: true })
  tasks: Task[];

  @Field((type) => [Task], { nullable: true })
  myTasks: Task[];

  @Field((type) => [Assignment], { nullable: true })
  assignments: Assignment[];
}
