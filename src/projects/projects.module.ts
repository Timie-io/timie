import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsModule } from '../teams/teams.module';
import { UsersModule } from '../users/users.module';
import { ProjectView } from './project-view.entity';
import { Project } from './project.entity';
import { ProjectsResolver } from './projects.resolver';
import { ProjectsService } from './projects.service';

@Module({
  exports: [ProjectsService],
  imports: [
    TypeOrmModule.forFeature([Project, ProjectView]),
    UsersModule,
    TeamsModule,
  ],
  providers: [ProjectsService, ProjectsResolver],
})
export class ProjectsModule {}
