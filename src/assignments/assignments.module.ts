import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusModule } from '../status/status.module';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { Assignment } from './assignment.entity';
import { AssignmentsResolver } from './assignments.resolver';
import { AssignmentsService } from './assignments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment]),
    UsersModule,
    TasksModule,
    StatusModule,
  ],
  providers: [AssignmentsService, AssignmentsResolver],
})
export class AssignmentsModule {}
