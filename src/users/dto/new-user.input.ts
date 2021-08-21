import { Field, InputType } from '@nestjs/graphql';
import { Length, IsEmail, IsOptional, MinLength } from 'class-validator';

@InputType()
export class NewUserInput {
  @Field()
  @Length(5, 128)
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsOptional()
  isAdmin: boolean;
}
