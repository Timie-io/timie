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
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Team } from '../teams/team.entity';
import { TeamsService } from '../teams/teams.service';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { NewProjectInput } from './dto/new-project-input';
import { ProjectAddedInput } from './dto/project-added.input';
import { ProjectsFindArgs } from './dto/projects-find.args';
import { ProjectsViewArgs } from './dto/projects-view.args';
import { UpdateProjectInput } from './dto/update-project.input';
import { Project } from './models/project.model';
import { ProjectsResult } from './models/projects-result.model';
import { ProjectsViewResult } from './models/projects-view-result.model';
import { ProjectsService } from './projects.service';

const pubSub = new PubSub();

@Resolver((of) => Project)
export class ProjectsResolver {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly teamsService: TeamsService,
    private readonly usersService: UsersService,
  ) {}

  @ResolveField()
  async owner(@Parent() project: Project) {
    const projectEntity = await this.projectsService.findOneById(
      Number(project.id),
      'owner',
    );
    return projectEntity.owner;
  }

  @ResolveField()
  async team(@Parent() project: Project) {
    const projectEntity = await this.projectsService.findOneById(
      Number(project.id),
      'team',
    );
    return projectEntity.team;
  }

  @Query((returns) => Project)
  @UseGuards(GqlAuthGuard)
  async project(@Args('id', { type: () => ID }) id: string) {
    const project = await this.projectsService.findOneById(Number(id));
    if (!project) {
      throw new NotFoundException('project does not found');
    }
    return project;
  }

  @Query((returns) => ProjectsResult)
  @UseGuards(GqlAuthGuard)
  async projects(@Args() args: ProjectsFindArgs) {
    const [result, total] = await this.projectsService.findAll(args);
    return {
      result,
      total,
    };
  }

  @Query((returns) => ProjectsViewResult)
  @UseGuards(GqlAuthGuard)
  async projectsView(@Args() args: ProjectsViewArgs) {
    const [result, total] = await this.projectsService.findView(args);
    return {
      result,
      total,
    };
  }

  @Query((returns) => [Project], { nullable: true })
  @UseGuards(GqlAuthGuard)
  async myProjects(@CurrentUser() user: User) {
    const currentUser = await this.usersService.findOneById(
      Number(user.id),
      'projects',
    );
    return currentUser.projects;
  }

  @Mutation((returns) => Project)
  @UseGuards(GqlAuthGuard)
  async createProject(
    @Args('data') data: NewProjectInput,
    @Args('teamId', { type: () => ID, nullable: true }) teamId: string,
    @CurrentUser() user: User,
  ) {
    let team: Team;
    if (teamId) {
      team = await this.teamsService.findOneById(Number(teamId));
      if (!team) {
        throw new NotFoundException('team not found');
      }
    }
    const owner = await this.usersService.findOneById(Number(user.id));
    const project = await this.projectsService.create(data, team, owner);
    pubSub.publish('projectAdded', { projectAdded: project });
    return project;
  }

  @Mutation((returns) => Project)
  @UseGuards(GqlAuthGuard)
  async updateProject(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateProjectInput,
    @CurrentUser() user: User,
  ) {
    const project = await this.projectsService.findOneById(Number(id), 'owner');
    if (!project) {
      throw new NotFoundException('project not found');
    }
    if (project.owner.id !== Number(user.id)) {
      throw new UnauthorizedException('action not allowed');
    }
    return this.projectsService.update(project, data);
  }

  @Mutation((returns) => Project)
  @UseGuards(GqlAuthGuard)
  async removeProject(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    const project = await this.projectsService.findOneById(Number(id), 'owner');
    if (!project) {
      throw new NotFoundException('project not found');
    }
    if (project.owner.id !== Number(user.id)) {
      throw new UnauthorizedException('action not allowed');
    }
    const copy = { ...project };
    await this.projectsService.remove(project);
    pubSub.publish('projectRemoved', { projectRemoved: copy });
    return copy;
  }

  @Subscription((returns) => Project, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.ownerId) {
        if (payload.teamAdded.ownerId !== Number(variables.input.ownerId)) {
          return false;
        }
      }
      if (variables.input && variables.input.teamId) {
        if (payload.teamAdded.teamId !== Number(variables.input.teamId)) {
          return false;
        }
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  projectAdded(
    @Args('input', { type: () => ProjectAddedInput, nullable: true })
    input: ProjectAddedInput,
  ) {
    return pubSub.asyncIterator('projectAdded');
  }

  @Subscription((returns) => Project, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.ownerId) {
        if (payload.teamAdded.ownerId !== Number(variables.input.ownerId)) {
          return false;
        }
      }
      if (variables.input && variables.input.teamId) {
        if (payload.teamAdded.teamId !== Number(variables.input.teamId)) {
          return false;
        }
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  projectRemoved(
    @Args('input', { type: () => ProjectAddedInput, nullable: true })
    input: ProjectAddedInput,
  ) {
    return pubSub.asyncIterator('projectRemoved');
  }
}
