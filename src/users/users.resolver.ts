import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => User)
  @UseGuards(GqlAuthGuard)
  async user(@Args('id') id: string, @CurrentUser() user: User) {
    if (!(user.id === id || user.isAdmin)) {
      throw new UnauthorizedException();
    }
    return this.usersService.findOneById(parseInt(id));
  }

  @Query((returns) => User)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: User) {
    return this.usersService.findOneById(parseInt(user.id));
  }
}
