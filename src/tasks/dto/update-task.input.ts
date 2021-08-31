import { Field, InputType } from '@nestjs/graphql';
import { Length, Max, Min } from 'class-validator';

@InputType()
export class UpdateTaskInput {
  @Field({ nullable: true })
  @Length(1, 100)
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  @Min(0)
  @Max(10)
  priority: number;

  @Field({ nullable: true })
  active: boolean;
}
