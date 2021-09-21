import {
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => User)
  @UseGuards(GqlAuthGuard)
  async user(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    if (!(parseInt(user.id) === parseInt(id) || user.isAdmin)) {
      throw new UnauthorizedException();
    }
    const result = await this.usersService.findOneById(parseInt(id));
    if (!result) {
      throw new NotFoundException('user not found');
    }
    return result;
  }

  @Query((returns) => [User])
  @UseGuards(GqlAuthGuard)
  async users() {
    return this.usersService.findAll();
  }

  @Query((returns) => User)
  @UseGuards(GqlAuthGuard)
  async loggedUser(@CurrentUser() user: User) {
    const result = await this.usersService.findOneById(parseInt(user.id));
    if (!result) {
      throw new NotFoundException('user not found');
    }
    return result;
  }

  @ResolveField()
  async teams(@Parent() user: User) {
    const { teams } = await this.usersService.findOneById(
      parseInt(user.id),
      'teams',
    );
    return teams;
  }

  @ResolveField()
  async ownedTeams(@Parent() user: User) {
    const { ownedTeams } = await this.usersService.findOneById(
      parseInt(user.id),
      'ownedTeams',
    );
    return ownedTeams;
  }

  @ResolveField()
  async tasks(@Parent() user: User) {
    const { tasks } = await this.usersService.findOneById(
      Number(user.id),
      'tasks',
    );
    return tasks;
  }

  @ResolveField()
  async myTasks(@Parent() user: User) {
    const { myTasks } = await this.usersService.findOneById(
      Number(user.id),
      'tasks',
    );
    return myTasks;
  }

  @ResolveField()
  async assignments(@Parent() user: User) {
    const { assignments } = await this.usersService.findOneById(
      Number(user.id),
      'assignments',
    );
    return assignments;
  }

  @ResolveField()
  async entries(@Parent() user: User) {
    const { entries } = await this.usersService.findOneById(
      Number(user.id),
      'entries',
    );
    return entries;
  }
}
