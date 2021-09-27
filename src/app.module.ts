import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { ComplexityPlugin } from './common/plugins/complexity.plugin';
import { EntriesModule } from './entries/entries.module';
import { ProjectsModule } from './projects/projects.module';
import { StatusModule } from './status/status.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: 'schema.gql',
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      context: ({ req, connection }) => {
        // subscriptions
        if (connection) {
          return {
            req: {
              headers: {
                authorization: connection.context['Authorization']
                  ? connection.context['Authorization']
                  : connection.context['authorization'],
              },
            },
          };
        }
        // queries and mutations
        return { req };
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          url: config.get<string>('DB_URL'),
          entities: config.get<string>('ENTITIES').split(','),
          synchronize: config.get<boolean>('DB_SYNC'),
          migrationsRun: false,
          keepConnectionAlive: true,
        };
      },
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          config: {
            url: config.get<string>('REDIS_URL'),
          },
        };
      },
    }),
    UsersModule,
    AuthModule,
    TeamsModule,
    ProjectsModule,
    TasksModule,
    AssignmentsModule,
    StatusModule,
    EntriesModule,
    CommentsModule,
  ],
  providers: [
    ComplexityPlugin,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(),
    },
  ],
})
export class AppModule {}
