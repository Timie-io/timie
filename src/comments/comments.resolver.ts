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
import { User } from '../users/models/user.model';
import { GqlAuthGuard } from './../auth/guards/gql-auth.guard';
import { TasksService } from './../tasks/tasks.service';
import { UsersService } from './../users/users.service';
import { CommentsService } from './comments.service';
import { CommentAddedInput } from './dto/comment-added.input';
import { CommentsFindArgs } from './dto/comments-find.args';
import { NewCommentInput } from './dto/new-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment } from './model/comment.model';
import { CommentsResult } from './model/comments-result.model';

const pubSub = new PubSub();

@Resolver((of) => Comment)
export class CommentsResolver {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}

  @ResolveField()
  async task(@Parent() comment: Comment) {
    const { task } = await this.commentsService.findOneById(
      Number(comment.id),
      'task',
    );
    return task;
  }

  @ResolveField()
  async user(@Parent() comment: Comment) {
    const { user } = await this.commentsService.findOneById(
      Number(comment.id),
      'user',
    );
    return user;
  }

  @Query((returns) => Comment)
  @UseGuards(GqlAuthGuard)
  async comment(@Args('id', { type: () => ID }) id: string) {
    const comment = await this.commentsService.findOneById(Number(id));
    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    return comment;
  }

  @Query((returns) => CommentsResult)
  @UseGuards(GqlAuthGuard)
  async comments(@Args() args: CommentsFindArgs) {
    const [result, total] = await this.commentsService.findAll(args);
    return {
      total,
      result,
    };
  }

  @Mutation((returns) => Comment)
  @UseGuards(GqlAuthGuard)
  async createComment(
    @Args('data') data: NewCommentInput,
    @Args('taskId', { type: () => ID }) taskId: string,
    @CurrentUser() user: User,
  ) {
    const task = await this.tasksService.findOneById(Number(taskId));
    if (!task) {
      throw new BadRequestException('task does not exist');
    }
    const userEntity = await this.usersService.findOneById(Number(user.id));
    const comment = await this.commentsService.create(data, task, userEntity);
    pubSub.publish('commentAdded', { commentAdded: comment });
    return comment;
  }

  @Mutation((returns) => Comment)
  @UseGuards(GqlAuthGuard)
  async updateComment(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateCommentInput,
    @CurrentUser() user: User,
  ) {
    const comment = await this.commentsService.findOneById(Number(id));
    if (!comment) {
      throw new NotFoundException('comment does not exist');
    }
    if (comment.userId !== Number(user.id)) {
      throw new UnauthorizedException('you are not allowed');
    }
    return await this.commentsService.update(comment, data);
  }

  @Mutation((returns) => Comment)
  @UseGuards(GqlAuthGuard)
  async removeComment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    const comment = await this.commentsService.findOneById(Number(id));
    if (!comment) {
      throw new NotFoundException('comment does not exist');
    }
    if (comment.userId !== Number(user.id)) {
      throw new UnauthorizedException('you are not allowed');
    }
    const copy = { ...comment };
    await this.commentsService.remove(comment);
    pubSub.publish('commentRemoved', { commentRemoved: copy });
    return copy;
  }

  @Subscription((returns) => Comment, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.taskId) {
        if (payload.commentAdded.taskId !== Number(variables.input.taskId)) {
          return false;
        }
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  commentAdded(
    @Args('input', { type: () => CommentAddedInput, nullable: true })
    input: CommentAddedInput,
  ) {
    return pubSub.asyncIterator('commentAdded');
  }

  @Subscription((returns) => Comment, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.taskId) {
        if (payload.commentAdded.taskId !== Number(variables.input.taskId)) {
          return false;
        }
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  commentRemoved(
    @Args('input', { type: () => CommentAddedInput, nullable: true })
    input: CommentAddedInput,
  ) {
    return pubSub.asyncIterator('commentRemoved');
  }
}
