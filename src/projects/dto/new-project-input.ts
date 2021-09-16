import { Field, InputType } from '@nestjs/graphql';
import { Length, MaxLength } from 'class-validator';

@InputType()
export class NewProjectInput {
  @Field()
  @Length(1, 32)
  name: string;

  @Field()
  @MaxLength(256)
  description: string;

  @Field({ defaultValue: true })
  active: boolean;
}
