import { Field, Int, ObjectType } from '@nestjs/graphql';
import { EntryView } from './entry-view.model';

@ObjectType()
export class EntriesViewResult {
  @Field((type) => [EntryView])
  result: EntryView[];

  @Field((type) => Int)
  total: number;

  @Field((type) => Int, { nullable: true })
  totalTime: number;
}
