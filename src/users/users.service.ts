import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindArgs } from '../shared/dto/find.args';
import { NewUserInput } from './dto/new-user.input';
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

  async findOneById(
    id: number,
    ...relations: string[]
  ): Promise<User | undefined> {
    return await this.repository.findOne(id, { relations });
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return await this.repository.findOne({ email: email });
  }

  async findAll(args?: FindArgs): Promise<User[]> {
    return await this.repository.find(args);
  }

  async update(user: User, data: Partial<User>): Promise<User> {
    Object.assign(user, data);
    return await this.repository.save(user);
  }

  async remove(user: User): Promise<User> {
    return await this.repository.remove(user);
  }
}
