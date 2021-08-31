import { Field, ID, InputType } from '@nestjs/graphql';
import { Length, Max, Min } from 'class-validator';

@InputType()
export class NewTaskInput {
  @Field()
  @Length(1, 100)
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field({ defaultValue: 0 })
  @Min(0)
  @Max(10)
  priority: number;

  @Field({ nullable: true })
  active: boolean;

  @Field((type) => ID)
  projectId: string;
}
