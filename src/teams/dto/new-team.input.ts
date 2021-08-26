import { Field, InputType } from '@nestjs/graphql';
import { Length, MaxLength } from 'class-validator';

@InputType()
export class NewTeamInput {
  @Field()
  @Length(1, 32)
  name: string;

  @Field()
  @MaxLength(256)
  description: string;
}
