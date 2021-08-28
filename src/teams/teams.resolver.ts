import {
  BadRequestException,
  ForbiddenException,
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
import { User } from '../users/models/user.model';
import { User as UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NewTeamInput } from './dto/new-team.input';
import { Team } from './models/team.model';
import { TeamsService } from './teams.service';

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

  @Query((returns) => Team)
  @UseGuards(GqlAuthGuard)
  async team(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
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

  @Query((returns) => [Team], { nullable: true })
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

  @Mutation((returns) => Team)
  @UseGuards(GqlAuthGuard)
  async createTeam(
    @Args('data') data: NewTeamInput,
    @CurrentUser() user: User,
  ) {
    const team = await this.teamsService.findOneByName(data.name);
    if (team) {
      throw new BadRequestException('team with same name already exists');
    }
    const owner = { ...user, id: Number(user.id), teams: [] } as UserEntity;
    return await this.teamsService.create(data, owner);
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
    return await this.teamsService.remove(team);
  }

  @Mutation((returns) => Team)
  @UseGuards(GqlAuthGuard)
  async updateTeam(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: Partial<NewTeamInput>,
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
      'members',
    );
    if (!team) {
      throw new NotFoundException('team does not exist');
    }
    const member = await this.usersService.findOneById(parseInt(userId));
    if (!member) {
      throw new BadRequestException('user does not exist');
    }
    return this.teamsService.addUser(team, member);
  }
}
