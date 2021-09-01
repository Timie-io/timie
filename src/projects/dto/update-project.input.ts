import { InputType, PartialType } from '@nestjs/graphql';
import { NewProjectInput } from './new-project-input';

@InputType()
export class UpdateProjectInput extends PartialType(NewProjectInput) {}
