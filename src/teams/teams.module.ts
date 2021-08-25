import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsResolver } from './teams.resolver';

@Module({
  providers: [TeamsService, TeamsResolver]
})
export class TeamsModule {}
