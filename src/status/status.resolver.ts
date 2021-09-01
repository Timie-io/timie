import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { NewStatusInput } from './dto/new-status.input';
import { UpdateStatusInput } from './dto/update-status.input';
import { Status } from './models/status.model';
import { StatusService } from './status.service';

@Resolver((of) => Status)
export class StatusResolver {
  constructor(private readonly statusService: StatusService) {}

  @Query((returns) => Status)
  @UseGuards(GqlAuthGuard)
  async status(@Args('code', { type: () => ID }) code: string) {
    const status = await this.statusService.findOneByCode(code);
    if (!status) {
      throw new NotFoundException('status not found');
    }
    return status;
  }

  @Query((returns) => [Status])
  @UseGuards(GqlAuthGuard)
  async statuses() {
    return await this.statusService.findAll();
  }

  @Mutation((returns) => Status)
  @UseGuards(GqlAuthGuard)
  async createStatus(@Args('data') data: NewStatusInput) {
    return await this.statusService.create(data);
  }

  @Mutation((returns) => Status)
  @UseGuards(GqlAuthGuard)
  async updateStatus(
    @Args('code', { type: () => ID }) code: string,
    @Args('data') data: UpdateStatusInput,
  ) {
    const status = await this.statusService.findOneByCode(code);
    if (!status) {
      throw new NotFoundException('status not found');
    }
    return await this.statusService.update(status, data);
  }

  @Mutation((returns) => Status)
  @UseGuards(GqlAuthGuard)
  async removeStatus(@Args('code', { type: () => ID }) code: string) {
    const status = await this.statusService.findOneByCode(code);
    if (!status) {
      throw new NotFoundException('status not found');
    }
    const copy = { ...status };
    await this.statusService.remove(status);
    return copy;
  }
}
