import { NotFoundException } from '@nestjs/common';
import { Args, Resolver, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user.model';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query((returns) => User)
  async user(@Args('id') id: string) {
    const user = new User();
    user.id = '1234';
    user.name = 'Emiliano';
    user.email = 'emr.frei@gmail.com';
    user.password = '1234';
    return user;
  }
}
