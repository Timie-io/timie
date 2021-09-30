import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SortInput {
  @Field()
  columnName: string;

  @Field({ defaultValue: 'ASC' })
  sortType: 'ASC' | 'DESC';
}
