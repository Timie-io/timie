import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './../tasks/tasks.module';
import { UsersModule } from './../users/users.module';
import { Comment } from './comment.entity';
import { CommentsResolver } from './comments.resolver';
import { CommentsService } from './comments.service';

@Module({
  providers: [CommentsService, CommentsResolver],
  imports: [TypeOrmModule.forFeature([Comment]), TasksModule, UsersModule],
})
export class CommentsModule {}
