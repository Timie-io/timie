import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { NewTaskInput } from './new-task.input';

@InputType()
export class UpdateTaskInput extends PartialType(
  OmitType(NewTaskInput, ['projectId']),
) {}
