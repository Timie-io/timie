import {
  BadRequestException,
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
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { NewTeamInput } from './dto/new-team.input';
import { TeamAddedInput } from './dto/team-added.input';
import { TeamsFindArgs } from './dto/teams-find.args';
import { UpdateTeamInput } from './dto/update-team.input';
import { Team } from './models/team.model';
import { TeamsResult } from './models/teams-result.model';
import { TeamsService } from './teams.service';

const pubSub = new PubSub();

@Resolver((of) => Team)
export class TeamsResolver {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly usersService: UsersService,
  ) {}

  @ResolveField()
  async owner(@Parent() team: Team) {
    const teamEntity = await this.teamsService.findOneById(
      parseInt(team.id),
      'owner',
    );
    return teamEntity.owner;
  }

  @ResolveField()
  async members(@Parent() team: Team) {
    const { members } = await this.teamsService.findOneById(
      parseInt(team.id),
      'members',
    );
    return members;
  }

  @ResolveField()
  async projects(@Parent() team: Team) {
    const teamEntity = await this.teamsService.findOneById(
      Number(team.id),
      'projects',
    );
    return team.projects;
  }

  @Query((returns) => Team)
  @UseGuards(GqlAuthGuard)
  async team(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    const team = await this.teamsService.findOneById(parseInt(id));
    if (!team) {
      throw new NotFoundException('team not found');
    }
    return team;
  }

  @Query((returns) => TeamsResult, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async teams(@Args() args: TeamsFindArgs) {
    const [result, total] = await this.teamsService.findAll(args);
    return {
      result,
      total,
    };
  }

  @Query((returns) => [Team], { nullable: true })
  @UseGuards(GqlAuthGuard)
  async myTeams(@CurrentUser() user: User) {
    const currentUser = await this.usersService.findOneById(
      parseInt(user.id),
      'teams',
    );
    if (!currentUser.teams || currentUser.teams.length === 0) {
      return [];
    }
    return currentUser.teams;
  }

  @Mutation((returns) => Team)
  @UseGuards(GqlAuthGuard)
  async createTeam(
    @Args('data') data: NewTeamInput,
    @CurrentUser() user: User,
  ) {
    const oldTeam = await this.teamsService.findOneByName(data.name);
    if (oldTeam) {
      throw new BadRequestException('team with same name already exists');
    }
    const owner = await this.usersService.findOneById(Number(user.id));
    const team = await this.teamsService.create(data, owner);
    pubSub.publish('teamAdded', { teamAdded: team });
    return team;
  }

  @Mutation((returns) => Team)
  @UseGuards(GqlAuthGuard)
  async removeTeam(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    const team = await this.teamsService.findOneById(parseInt(id), 'owner');
    if (!team) {
      throw new NotFoundException('team does not exist');
    }
    if (team.owner.id !== Number(user.id)) {
      throw new UnauthorizedException('action not allowed');
    }
    const copy = { ...team };
    await this.teamsService.remove(team);
    pubSub.publish('teamRemoved', { teamRemoved: copy });
    return copy;
  }

  @Mutation((returns) => Team)
  @UseGuards(GqlAuthGuard)
  async updateTeam(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateTeamInput,
    @CurrentUser() user: User,
  ) {
    const team = await this.teamsService.findOneById(parseInt(id), 'owner');
    if (!team) {
      throw new NotFoundException('team does not exist');
    }
    if (team.owner.id !== Number(user.id)) {
      throw new UnauthorizedException('action not allowed');
    }
    return await this.teamsService.update(team, data);
  }

  @Mutation((returns) => Team)
  @UseGuards(GqlAuthGuard)
  async addTeamMember(
    @Args('teamId', { type: () => ID }) teamId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() user: User,
  ) {
    const team = await this.teamsService.findOneById(
      parseInt(teamId),
      'owner',
      'members',
    );
    if (!team) {
      throw new NotFoundException('team does not exist');
    }
    if (team.owner.id !== Number(user.id)) {
      throw new UnauthorizedException('action not allowed');
    }
    const member = await this.usersService.findOneById(parseInt(userId));
    if (!member) {
      throw new BadRequestException('user does not exist');
    }
    return this.teamsService.addUser(team, member);
  }

  @Subscription((returns) => Team, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.ownerId) {
        return payload.teamAdded.ownerId === Number(variables.input.ownerId);
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  teamAdded(
    @Args('input', { type: () => TeamAddedInput, nullable: true })
    input: TeamAddedInput,
  ) {
    return pubSub.asyncIterator('teamAdded');
  }

  @Subscription((returns) => Team, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.ownerId) {
        return payload.teamAdded.ownerId === Number(variables.input.ownerId);
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  teamRemoved(
    @Args('input', { type: () => TeamAddedInput, nullable: true })
    input: TeamAddedInput,
  ) {
    return pubSub.asyncIterator('teamRemoved');
  }
}
