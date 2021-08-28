import { Field, ObjectType } from '@nestjs/graphql';
import { Length, MaxLength } from 'class-validator';

@ObjectType()
export class UpdateProjectInput {
  @Field({ nullable: true })
  @Length(1, 32)
  name: string;

  @Field({ nullable: true })
  @MaxLength(256)
  description: string;
}
