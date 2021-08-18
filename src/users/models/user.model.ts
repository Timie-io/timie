import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  creationDate: Date;

  @Field()
  password: string;

  @Field({ defaultValue: false })
  isAdmin: boolean;
}
