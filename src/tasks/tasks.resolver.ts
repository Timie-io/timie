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
import { TasksViewArgs } from './dto/tasks-view.args';
import { UpdateTaskInput } from './dto/update-task.input';
import { Task } from './models/task.model';
import { TasksResult } from './models/tasks-result.model';
import { TasksViewResult } from './models/tasks-view-result.model';
import { Task as TaskEntity } from './task.entity';
import { TasksService } from './tasks.service';

const pubSub = new PubSub();

function filterSubscriptionInput(task: TaskEntity, input: TaskAddedInput) {
  let output = true;
  if (input) {
    if (input.title) {
      output = task.title.includes(input.title);
    }
    if (output && input.active) {
      output = task.active === input.active;
    }
    if (output && input.projectId) {
      output = task.projectId === Number(input.projectId);
    }
  }
  return output;
}

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

  @ResolveField()
  async assignments(@Parent() task: Task) {
    const { assignments } = await this.tasksService.findOneById(
      Number(task.id),
      'assignments',
    );
    return assignments;
  }

  @ResolveField()
  async comments(@Parent() task: Task) {
    const { comments } = await this.tasksService.findOneById(
      Number(task.id),
      'comments',
    );
    return comments;
  }

  @Query((returns) => Task, { complexity: -20 })
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

  @Query((returns) => TasksViewResult)
  @UseGuards(GqlAuthGuard)
  async tasksView(@Args() args: TasksViewArgs) {
    const [result, total] = await this.tasksService.findView(args);
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

  @Mutation((returns) => Task)
  @UseGuards(GqlAuthGuard)
  async removeTaskFollower(
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
    return await this.tasksService.removeFollower(task, follower);
  }

  @Subscription((returns) => Task, {
    filter: (payload, variables) => {
      return filterSubscriptionInput(payload.taskAdded, variables.input);
    },
  })
  @UseGuards(GqlAuthGuard)
  taskAdded(@Args('input', { nullable: true }) input: TaskAddedInput) {
    return pubSub.asyncIterator('taskAdded');
  }

  @Subscription((returns) => Task, {
    filter: (payload, variables) => {
      return filterSubscriptionInput(payload.taskRemoved, variables.input);
    },
  })
  @UseGuards(GqlAuthGuard)
  taskRemoved(@Args('input', { nullable: true }) input: TaskAddedInput) {
    return pubSub.asyncIterator('taskRemoved');
  }
}
