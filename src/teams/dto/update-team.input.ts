import { InputType, PartialType } from '@nestjs/graphql';
import { NewTeamInput } from './new-team.input';

@InputType()
export class UpdateTeamInput extends PartialType(NewTeamInput) {}
