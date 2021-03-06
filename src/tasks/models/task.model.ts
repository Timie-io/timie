import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Assignment } from '../../assignments/models/assignment.model';
import { Comment } from '../../comments/model/comment.model';
import { Project } from '../../projects/models/project.model';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Task {
  @Field((type) => ID)
  id: number;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field({ defaultValue: 0 })
  priority: number;

  @Field()
  creationDate: Date;

  @Field({ nullable: true })
  lastModified: Date;

  @Field((type) => Project)
  project: Project;

  @Field()
  active: boolean;

  @Field((type) => User)
  creator: User;

  @Field((type) => [User], { nullable: 'items' })
  followers: User[];

  @Field((type) => [Assignment], { nullable: 'items' })
  assignments: Assignment[];

  @Field((type) => [Comment], { nullable: 'items' })
  comments: Comment[];
}
