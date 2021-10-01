import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { TeamView } from './team-view.entity';
import { Team } from './team.entity';
import { TeamsResolver } from './teams.resolver';
import { TeamsService } from './teams.service';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamView]), UsersModule],
  providers: [TeamsService, TeamsResolver],
  exports: [TeamsService],
})
export class TeamsModule {}
