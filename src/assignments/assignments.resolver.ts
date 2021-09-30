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
import { Status as StatusEntity } from '../status/status.entity';
import { StatusService } from '../status/status.service';
import { TasksService } from '../tasks/tasks.service';
import { User } from '../users/models/user.model';
import { User as UserEntity } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AssignmentsService } from './assignments.service';
import { AssignmentAddedInput } from './dto/assignment-added.input';
import { AssignmentsFindArgs } from './dto/assignments-find.args';
import { NewAssignmentInput } from './dto/new-assignment.input';
import { UpdateAssignmentInput } from './dto/update-assignment.input';
import { Assignment } from './models/assignment.model';
import { AssignmentsResult } from './models/assignments-result.model';

const pubSub = new PubSub();

@Resolver((of) => Assignment)
export class AssignmentsResolver {
  constructor(
    private readonly assignmentsService: AssignmentsService,
    private readonly statusService: StatusService,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}

  @ResolveField()
  async creator(@Parent() assignment: Assignment) {
    const { creator } = await this.assignmentsService.findOneById(
      Number(assignment.id),
      'creator',
    );
    return creator;
  }

  @ResolveField()
  async user(@Parent() assignment: Assignment) {
    const { user } = await this.assignmentsService.findOneById(
      Number(assignment.id),
      'user',
    );
    return user;
  }

  @ResolveField()
  async status(@Parent() assignment: Assignment) {
    const { status } = await this.assignmentsService.findOneById(
      Number(assignment.id),
      'status',
    );
    return status;
  }

  @ResolveField()
  async task(@Parent() assignment: Assignment) {
    const { task } = await this.assignmentsService.findOneById(
      Number(assignment.id),
      'task',
    );
    return task;
  }

  @ResolveField()
  async entries(@Parent() assignment: Assignment) {
    const { entries } = await this.assignmentsService.findOneById(
      Number(assignment.id),
      'entries',
    );
    return entries;
  }

  @ResolveField()
  async totalTime(@Parent() assignment: Assignment) {
    const { entries } = await this.assignmentsService.findOneById(
      Number(assignment.id),
      'entries',
    );
    let total = 0;
    for (let entry of entries) {
      if (entry.startTime && entry.finishTime) {
        total += Number(entry.finishTime) - Number(entry.startTime);
      }
    }
    return total;
  }

  @Query((returns) => Assignment)
  @UseGuards(GqlAuthGuard)
  async assignment(@Args('id', { type: () => ID }) id: string) {
    const assignment = await this.assignmentsService.findOneById(Number(id));
    if (!assignment) {
      throw new NotFoundException('assignment not found');
    }
    return assignment;
  }

  @Query((returns) => AssignmentsResult, { complexity: -10 })
  @UseGuards(GqlAuthGuard)
  async assignments(@Args() args: AssignmentsFindArgs) {
    const [result, total] = await this.assignmentsService.findAll(args);
    return {
      result,
      total,
    };
  }

  @Mutation((returns) => Assignment)
  @UseGuards(GqlAuthGuard)
  async createAssignment(
    @Args('data') data: NewAssignmentInput,
    @CurrentUser() currentUser: User,
  ) {
    const { taskId, userId, statusCode, ...assignment } = data;
    const task = await this.tasksService.findOneById(Number(taskId));
    if (!task) {
      throw new BadRequestException('task not found');
    }
    const creator = await this.usersService.findOneById(Number(currentUser.id));

    let user: UserEntity;
    let status: StatusEntity;

    if (userId) {
      user = await this.usersService.findOneById(Number(userId));
      if (!user) {
        throw new BadRequestException('user not found');
      }
    }

    if (statusCode) {
      status = await this.statusService.findOneByCode(statusCode);
    }
    const output = await this.assignmentsService.create(
      assignment,
      task,
      user,
      creator,
      status,
    );
    pubSub.publish('assignmentAdded', { assignmentAdded: output });
    return output;
  }

  @Mutation((returns) => Assignment)
  @UseGuards(GqlAuthGuard)
  async updateAssignment(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateAssignmentInput,
  ) {
    const assignment = await this.assignmentsService.findOneById(Number(id));
    if (!assignment) {
      throw new NotFoundException('assignment not found');
    }
    const { userId, statusCode, ...updateData } = data;
    let user: UserEntity;
    let status: StatusEntity;

    if (userId) {
      user = await this.usersService.findOneById(Number(userId));
    }
    if (statusCode) {
      status = await this.statusService.findOneByCode(statusCode);
    }
    return await this.assignmentsService.update(
      assignment,
      user,
      status,
      updateData,
    );
  }

  @Mutation((returns) => Assignment)
  @UseGuards(GqlAuthGuard)
  async removeAssignment(@Args('id', { type: () => ID }) id: string) {
    const assignment = await this.assignmentsService.findOneById(Number(id));
    if (!assignment) {
      throw new NotFoundException('assignmen not found');
    }
    const copy = { ...assignment };
    await this.assignmentsService.remove(assignment);
    pubSub.publish('assignmentRemoved', { assignmentRemoved: copy });
    return copy;
  }

  @Subscription((returns) => Assignment, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.taskId) {
        if (payload.assignmentAdded.taskId !== Number(variables.input.taskId)) {
          return false;
        }
      }
      if (variables.input && variables.input.userId) {
        if (payload.assignmentAdded.userId !== Number(variables.input.userId)) {
          return false;
        }
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  assignmentAdded(
    @Args('input', { nullable: true }) input: AssignmentAddedInput,
  ) {
    return pubSub.asyncIterator('assignmentAdded');
  }

  @Subscription((returns) => Assignment, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.taskId) {
        if (payload.assignmentAdded.taskId !== Number(variables.input.taskId)) {
          return false;
        }
      }
      if (variables.input && variables.input.userId) {
        if (payload.assignmentAdded.userId !== Number(variables.input.userId)) {
          return false;
        }
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  assignmentRemoved(
    @Args('input', { nullable: true }) input: AssignmentAddedInput,
  ) {
    return pubSub.asyncIterator('assignmentRemoved');
  }
}
