import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { NewEntryInput } from './new-entry.input';

@InputType()
export class UpdateEntryInput extends PartialType(
  OmitType(NewEntryInput, ['assignmentId', 'userId']),
) {}
