import { Field } from '@nestjs/graphql';
import { MinLength } from 'class-validator';
import { NewUserInput } from '../../users/dto/new-user.input';

export class SignUpUser extends NewUserInput {
  @Field()
  @MinLength(6)
  password: string;
}
