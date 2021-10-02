import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TaskView {
  @Field((type) => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field((type) => ID)
  projectId: string;

  @Field()
  projectName: string;

  @Field()
  active: boolean;

  @Field()
  created: Date;

  @Field((type) => ID)
  creatorId: string;

  @Field()
  creatorName: string;

  @Field({ nullable: true })
  modified: Date;

  @Field()
  priority: number;
}
