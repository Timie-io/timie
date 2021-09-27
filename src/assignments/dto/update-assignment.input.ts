import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { NewAssignmentInput } from './new-assignment.input';

@InputType()
export class UpdateAssignmentInput extends PartialType(
  OmitType(NewAssignmentInput, ['taskId']),
) {}
