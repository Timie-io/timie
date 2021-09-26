import { Field, InputType } from '@nestjs/graphql';
import { MinLength } from 'class-validator';

@InputType()
export class UpdatePasswordInput {
  @Field()
  @MinLength(6)
  password: string;
}
