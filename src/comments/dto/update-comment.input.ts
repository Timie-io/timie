import { InputType, PartialType } from '@nestjs/graphql';
import { NewCommentInput } from './new-comment.input';

@InputType()
export class UpdateCommentInput extends PartialType(NewCommentInput) {}
