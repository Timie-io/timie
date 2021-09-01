import { ArgsType, Field } from '@nestjs/graphql';
import { FindArgs } from '../../shared/dto/find.args';

@ArgsType()
export class AssignmentsFindArgs extends FindArgs {
  @Field({ nullable: true })
  userId: number;

  @Field({ nullable: true })
  taskId: number;

  @Field({ nullable: true })
  title: string;
}
