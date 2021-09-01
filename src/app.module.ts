import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { ComplexityPlugin } from './common/plugins/complexity.plugin';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamsModule } from './teams/teams.module';
import { UsersModule } from './users/users.module';
import { StatusModule } from './status/status.module';

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
          migrations: ['migration/*.ts'],
          cli: {
            migrationsDir: 'migration',
          },
          keepConnectionAlive: true,
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
  ],
  providers: [ComplexityPlugin],
})
export class AppModule {}
