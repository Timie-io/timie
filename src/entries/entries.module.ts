import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsModule } from '../assignments/assignments.module';
import { UsersModule } from './../users/users.module';
import { EntriesResolver } from './entries.resolver';
import { EntriesService } from './entries.service';
import { EntryView } from './entry-view.entity';
import { Entry } from './entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Entry, EntryView]),
    UsersModule,
    AssignmentsModule,
  ],
  providers: [EntriesService, EntriesResolver],
})
export class EntriesModule {}
