import { Field, InputType } from '@nestjs/graphql';
import { Length } from 'class-validator';

@InputType()
export class NewStatusInput {
  @Field()
  @Length(1, 2)
  code: string;

  @Field()
  @Length(1, 12)
  label: string;

  @Field()
  order: number;
}
