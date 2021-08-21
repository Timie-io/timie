import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewUserInput } from './dto/new-user.input';
import { UsersArgs } from './dto/users.args';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async create(data: NewUserInput): Promise<User> {
    const user = this.repository.create(data);

    return await this.repository.save(user);
  }

  async findOneById(id: number): Promise<User | undefined> {
    return await this.repository.findOne(id);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return await this.repository.findOne({ email: email });
  }

  async findAll(recipesArgs: UsersArgs): Promise<User[]> {
    return [] as User[];
  }

  async remove(id: string): Promise<boolean> {
    return true;
  }
}
