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
import { FindArgs } from '../shared/dto/find.args';
import { Team } from '../teams/team.entity';
import { TeamsService } from '../teams/teams.service';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { NewProjectInput } from './dto/new-project-input';
import { UpdateProjectInput } from './dto/update-project.input';
import { Project } from './models/project.model';
import { ProjectsResult } from './models/projects-result.model';
import { ProjectsService } from './projects.service';

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
  async projects(@Args() args: FindArgs) {
    const [result, total] = await this.projectsService.findAll(
      args.skip,
      args.take,
    );
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

  @Query((returns) => ProjectsResult, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async projectsByName(@Args('name') name: string, @Args() args: FindArgs) {
    const [result, total] = await this.projectsService.findAllByName(
      name,
      args.skip,
      args.take,
    );
    return {
      result,
      total,
    };
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
    return await this.projectsService.create(data, team, owner);
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
    return copy;
  }
}
