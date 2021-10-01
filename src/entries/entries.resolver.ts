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
import { AssignmentsService } from '../assignments/assignments.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { User } from '../users/models/user.model';
import { UsersService } from './../users/users.service';
import { EntriesFindArgs } from './dto/entries-find.args';
import { EntryChangedInput } from './dto/entry-changed.input';
import { NewEntryInput } from './dto/new-entry.input';
import { UpdateEntryInput } from './dto/update-entry.input';
import { EntriesService } from './entries.service';
import { EntriesResult } from './models/entries-result.model';
import { Entry } from './models/entry.model';

const pubSub = new PubSub();

@Resolver((of) => Entry)
export class EntriesResolver {
  constructor(
    private readonly entriesService: EntriesService,
    private readonly usersService: UsersService,
    private readonly assignmentsService: AssignmentsService,
  ) {}

  @ResolveField()
  async assignment(@Parent() entry: Entry) {
    const { assignment } = await this.entriesService.findOneById(
      Number(entry.id),
      'assignment',
    );
    return assignment;
  }

  @ResolveField()
  async user(@Parent() entry: Entry) {
    const { user } = await this.entriesService.findOneById(
      Number(entry.id),
      'user',
    );
    return user;
  }

  @Query((returns) => ID)
  @UseGuards(GqlAuthGuard)
  async entry(@Args('id', { type: () => ID }) id: string) {
    return await this.entriesService.findOneById(Number(id));
  }

  @Query((returns) => EntriesResult)
  @UseGuards(GqlAuthGuard)
  async entries(@Args() args: EntriesFindArgs) {
    const [result, total, totalTime] = await this.entriesService.findAll(args);
    return {
      result,
      total,
      totalTime,
    };
  }

  @Mutation((returns) => Entry)
  @UseGuards(GqlAuthGuard)
  async createEntry(
    @Args('data') data: NewEntryInput,
    @CurrentUser() user: User,
  ) {
    const { assignmentId, ...entryData } = data;
    const currentUser = await this.usersService.findOneById(Number(user.id));
    const assignment = assignmentId
      ? await this.assignmentsService.findOneById(Number(assignmentId))
      : undefined;
    if (assignmentId && !assignment) {
      throw new BadRequestException('assignment not found');
    }
    if (assignment && assignment.userId !== currentUser.id) {
      throw new UnauthorizedException(
        'You are not allwed to add entries for this assignment',
      );
    }
    const entry = await this.entriesService.create(
      entryData,
      currentUser,
      assignment,
    );
    pubSub.publish('entryAdded', { entryAdded: entry });
    return entry;
  }

  @Mutation((returns) => Entry)
  @UseGuards(GqlAuthGuard)
  async updateEntry(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateEntryInput,
  ) {
    const entry = await this.entriesService.findOneById(Number(id));
    if (!entry) {
      throw new NotFoundException('entry not found');
    }
    return await this.entriesService.update(entry, data);
  }

  @Mutation((returns) => Entry)
  @UseGuards(GqlAuthGuard)
  async removeEntry(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    const entry = await this.entriesService.findOneById(Number(id));
    if (!entry) {
      throw new NotFoundException('entry not found');
    }
    if (entry.userId !== Number(user.id)) {
      throw new UnauthorizedException(
        'You are not allowed to remove this entry',
      );
    }
    const copy = { ...entry };
    await this.entriesService.remove(entry);
    pubSub.publish('entryRemoved', { entryRemoved: copy });
    return copy;
  }

  @Mutation((returns) => Entry)
  @UseGuards(GqlAuthGuard)
  async startEntry(@Args('id', { type: () => ID }) id: string) {
    const entry = await this.entriesService.findOneById(Number(id));
    if (!entry) {
      throw new NotFoundException('entry not found');
    }
    pubSub.publish('entryStarted', { entryStarted: entry });
    return await this.entriesService.start(entry);
  }

  @Mutation((returns) => Entry)
  @UseGuards(GqlAuthGuard)
  async stopEntry(@Args('id', { type: () => ID }) id: string) {
    const entry = await this.entriesService.findOneById(Number(id));
    if (!entry) {
      throw new NotFoundException('entry not found');
    }
    pubSub.publish('entryStopped', { entryStopped: entry });
    return await this.entriesService.stop(entry);
  }

  @Subscription((returns) => Entry, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.assignmentId) {
        return (
          payload.entryAdded.assignmentId ===
          Number(variables.input.assignmentId)
        );
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  entryAdded(@Args('input', { nullable: true }) input: EntryChangedInput) {
    return pubSub.asyncIterator('entryAdded');
  }

  @Subscription((returns) => Entry, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.assignmentId) {
        return (
          payload.entryRemoved.assignmentId ===
          Number(variables.input.assignmentId)
        );
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  entryRemoved(@Args('input', { nullable: true }) input: EntryChangedInput) {
    return pubSub.asyncIterator('entryRemoved');
  }

  @Subscription((returns) => Entry, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.assignmentId) {
        return (
          payload.entryStarted.assignmentId ===
          Number(variables.input.assignmentId)
        );
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  entryStarted(@Args('input', { nullable: true }) input: EntryChangedInput) {
    return pubSub.asyncIterator('entryStarted');
  }

  @Subscription((returns) => Entry, {
    filter: (payload, variables) => {
      if (variables.input && variables.input.assignmentId) {
        return (
          payload.entryStopped.assignmentId ===
          Number(variables.input.assignmentId)
        );
      }
      return true;
    },
  })
  @UseGuards(GqlAuthGuard)
  entryStopped(@Args('input', { nullable: true }) input: EntryChangedInput) {
    return pubSub.asyncIterator('entryStopped');
  }
}
