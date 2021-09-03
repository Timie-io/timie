import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsModule } from '../assignments/assignments.module';
import { EntriesResolver } from './entries.resolver';
import { EntriesService } from './entries.service';
import { Entry } from './entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Entry]), AssignmentsModule],
  providers: [EntriesService, EntriesResolver],
})
export class EntriesModule {}
