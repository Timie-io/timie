import { Field, InputType } from '@nestjs/graphql';
import { Length, MaxLength } from 'class-validator';

@InputType()
export class UpdateTeamInput {
  @Field({ nullable: true })
  @Length(1, 32)
  name: string;

  @Field({ nullable: true })
  @MaxLength(256)
  description: string;
}
