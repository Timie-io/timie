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
import { AssignmentsService } from '../assignments/assignments.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
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

  @Query((returns) => ID)
  @UseGuards(GqlAuthGuard)
  async entry(@Args('id', { type: () => ID }) id: string) {
    return await this.entriesService.findOneById(Number(id));
  }

  @Query((returns) => EntriesResult)
  @UseGuards(GqlAuthGuard)
  async entries(@Args() args: EntriesFindArgs) {
    const [result, total] = await this.entriesService.findAll(args);
    return {
      result,
      total,
    };
  }

  @Mutation((returns) => Entry)
  @UseGuards(GqlAuthGuard)
  async createEntry(@Args('data') data: NewEntryInput) {
    const { assignmentId, ...entryData } = data;
    const assignment = await this.assignmentsService.findOneById(
      Number(assignmentId),
    );
    if (!assignment) {
      throw new BadRequestException('assignment not found');
    }
    return await this.entriesService.create(entryData, assignment);
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
  async removeEntry(@Args('id', { type: () => ID }) id: string) {
    const entry = await this.entriesService.findOneById(Number(id));
    if (!entry) {
      throw new NotFoundException('entry not found');
    }
    const copy = { ...entry };
    await this.entriesService.remove(entry);
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
