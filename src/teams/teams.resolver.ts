import {
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { Team } from './models/team.model';
import { TeamsService } from './teams.service';

@Resolver((of) => Team)
export class TeamsResolver {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly usersService: UsersService,
  ) {}

  @ResolveField()
  async members(@Parent() team: Team) {
    const { members } = await this.teamsService.findOneById(
      parseInt(team.id),
      'members',
    );
    return members;
  }

  @Query((returns) => Team)
  @UseGuards(GqlAuthGuard)
  async team(@Args('id') id: string, @CurrentUser() user: User) {
    const team = await this.teamsService.findOneById(parseInt(id), 'members');
    if (!team) {
      throw new NotFoundException('team not found');
    }
    const members = team.members.filter((member) => {
      return member.id === Number(user.id);
    });
    if (members.length === 0) {
      throw new ForbiddenException('not a member');
    }
    return team;
  }

  @Query((returns) => [Team])
  @UseGuards(GqlAuthGuard)
  async teams(@CurrentUser() user: User) {
    const currentUser = await this.usersService.findOneById(
      parseInt(user.id),
      'teams',
    );
    if (!currentUser.teams || currentUser.teams.length === 0) {
      return [];
    }
    return currentUser.teams;
  }
}
