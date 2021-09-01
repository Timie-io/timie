import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { NewStatusInput } from './new-status.input';

@InputType()
export class UpdateStatusInput extends PartialType(
  OmitType(NewStatusInput, ['code']),
) {}
