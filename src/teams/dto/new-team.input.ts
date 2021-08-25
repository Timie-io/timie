import { Field } from '@nestjs/graphql';
import { Length, MaxLength } from 'class-validator';

export class NewTeamInput {
  @Field()
  @Length(1, 32)
  name: string;

  @Field()
  @MaxLength(256)
  description: string;
}
