import {
  BadRequestException,
  NotFoundException,
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
import { Project } from '../projects/project.entity';
import { ProjectsService } from '../projects/projects.service';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { NewTaskInput } from './dto/new-task.input';
import { TaskAddedInput } from './dto/task-added.input';
import { TasksFindArgs } from './dto/tasks-find.args';
import { UpdateTaskInput } from './dto/update-task.input';
import { Task } from './models/task.model';
import { TasksResult } from './models/tasks-result.model';
import { TasksService } from './tasks.service';

const pubSub = new PubSub();

@Resolver((of) => Task)
export class TasksResolver {
  constructor(
    private readonly tasksService: TasksService,
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  @ResolveField()
  async project(@Parent() task: Task) {
    const { project } = await this.tasksService.findOneById(
      Number(task.id),
      'project',
    );
    return project;
  }

  @ResolveField()
  async creator(@Parent() task: Task) {
    const { creator } = await this.tasksService.findOneById(
      Number(task.id),
      'creator',
    );
    return creator;
  }

  @ResolveField()
  async followers(@Parent() task: Task) {
    const { followers } = await this.tasksService.findOneById(
      Number(task.id),
      'followers',
    );
    return followers;
  }

  @Query((returns) => Task)
  @UseGuards(GqlAuthGuard)
  async task(@Args('id', { type: () => ID }) id: string) {
    const task = await this.tasksService.findOneById(Number(id));
    if (!task) {
      throw new NotFoundException('task not found');
    }
    return task;
  }

  @Query((returns) => TasksResult)
  @UseGuards(GqlAuthGuard)
  async tasks(@Args() args: TasksFindArgs) {
    const [result, total] = await this.tasksService.findAll(args);
    return {
      result,
      total,
    };
  }

  @Mutation((returns) => Task)
  @UseGuards(GqlAuthGuard)
  async createTask(
    @Args('data') data: NewTaskInput,
    @CurrentUser() user: User,
  ) {
    let project: Project;
    const { projectId, ...taskData } = data;
    if (projectId) {
      project = await this.projectsService.findOneById(Number(projectId));
      if (!project) {
        throw new BadRequestException('project not found');
      }
    }
    const creator = await this.usersService.findOneById(Number(user.id));
    const task = await this.tasksService.create(taskData, project, creator);
    pubSub.publish('taskAdded', { taskAdded: task });
    return task;
  }

  @Mutation((returns) => Task)
  @UseGuards(GqlAuthGuard)
  async updateTask(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateTaskInput,
  ) {
    const task = await this.tasksService.findOneById(Number(id));
    if (!task) {
      throw new NotFoundException('task not found');
    }
    return await this.tasksService.update(task, data);
  }

  @Mutation((returns) => Task)
  @UseGuards(GqlAuthGuard)
  async removeTask(@Args('id', { type: () => ID }) id: string) {
    const task = await this.tasksService.findOneById(Number(id));
    if (!task) {
      throw new NotFoundException('task not found');
    }
    const copy = { ...task };
    await this.tasksService.remove(task);
    pubSub.publish('taskRemoved', { taskRemoved: copy });
    return copy;
  }

  @Mutation((returns) => Task)
  @UseGuards(GqlAuthGuard)
  async addTaskFollower(
    @Args('id', { type: () => ID }) id: string,
    @Args('userId', { type: () => ID }) userId: string,
  ) {
    const task = await this.tasksService.findOneById(Number(id), 'followers');
    if (!task) {
      throw new NotFoundException('task not found');
    }
    const follower = await this.usersService.findOneById(Number(userId));
    if (!follower) {
      throw new BadRequestException('user not found');
    }
    return await this.tasksService.addFollower(task, follower);
  }

  @Subscription((returns) => Task, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.projectId) {
        return (
          payload.taskAdded.projectId === Number(variables.input.projectId)
        );
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  taskAdded(@Args('input', { nullable: true }) input: TaskAddedInput) {
    return pubSub.asyncIterator('taskAdded');
  }

  @Subscription((returns) => Task, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.projectId) {
        return (
          payload.taskAdded.projectId === Number(variables.input.projectId)
        );
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  taskRemoved(@Args('input', { nullable: true }) input: TaskAddedInput) {
    return pubSub.asyncIterator('taskRemoved');
  }
}
