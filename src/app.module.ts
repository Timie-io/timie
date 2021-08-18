import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    // GraphQLModule.forRoot({
    //   installSubscriptionHandlers: true,
    //   autoSchemaFile: 'schema.gql',
    // }),
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
        };
      },
    }),
    UsersModule,
  ],
})
export class AppModule {}
