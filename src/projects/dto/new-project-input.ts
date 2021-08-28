import { Field, ObjectType } from '@nestjs/graphql';
import { Length, MaxLength } from 'class-validator';

@ObjectType()
export class NewProjectInput {
  @Field()
  @Length(1, 32)
  name: string;

  @Field()
  @MaxLength(256)
  description: string;
}
