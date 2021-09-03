import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Entry } from '../models/entry.model';

@ObjectType()
export class EntriesResult {
  @Field((type) => [Entry])
  result: Entry[];

  @Field((type) => Int)
  total: number;
}
