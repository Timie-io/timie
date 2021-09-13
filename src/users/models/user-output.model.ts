import { ObjectType, OmitType, PartialType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class UserOutput extends PartialType(OmitType(User, ['password'])) {}
