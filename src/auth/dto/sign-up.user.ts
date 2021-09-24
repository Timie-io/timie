import { MinLength } from 'class-validator';
import { NewUserInput } from '../../users/dto/new-user.input';

export class SignUpUser extends NewUserInput {
  @MinLength(6)
  password: string;
}
