import {
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { AuthService } from './../auth/auth.service';
import { UpdatePasswordInput } from './dto/update-password.input';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

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

  @ResolveField()
  async comments(@Parent() user: User) {
    const { comments } = await this.usersService.findOneById(
      Number(user.id),
      'comments',
    );
    return comments;
  }

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
    return await this.usersService.findAll();
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

  @Mutation((returns) => User)
  @UseGuards(GqlAuthGuard)
  async updateUserPassword(
    @CurrentUser() user: User,
    @Args('data', { type: () => UpdatePasswordInput })
    data: UpdatePasswordInput,
  ) {
    const userEntity = await this.usersService.findOneById(Number(user.id));
    const hashedPassword = await AuthService.generateSaltedHashedPassword(
      data.password,
    );
    return await this.usersService.update(userEntity, {
      password: hashedPassword,
    });
  }

  @Mutation((returns) => User)
  @UseGuards(GqlAuthGuard)
  async removeUser(@CurrentUser() user: User) {
    const userEntity = await this.usersService.findOneById(Number(user.id));
    const copy = { ...userEntity };
    await this.usersService.remove(userEntity);
    return copy;
  }
}
