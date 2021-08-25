import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { NewTeamInput } from './dto/new-team.input';
import { Team } from './team.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private readonly repository: Repository<Team>,
  ) {}

  async findOneById(
    id: number,
    ...relations: string[]
  ): Promise<Team | undefined> {
    const query = { id: id };
    return this.repository.findOne(query, { relations });
  }

  async findOneByName(
    name: string,
    ...relations: string[]
  ): Promise<Team | undefined> {
    const query = { name: name };
    return this.repository.findOne(query, { relations });
  }

  async create(data: NewTeamInput, owner: User): Promise<Team> {
    let team = await this.findOneByName(data.name);
    if (team) {
      throw new BadRequestException('team exists');
    }
    team = this.repository.create(data);
    team.members.push(owner);
    return await this.repository.save(team);
  }

  async addUser(id: number, user: User): Promise<Team> {
    const team = await this.repository.findOne(id);
    if (!team) {
      throw new NotFoundException('team not found');
    }
    team.members.push(user);
    return await this.repository.save(team);
  }

  async remove(id: number): Promise<Team> {
    let team = await this.repository.findOne(id);
    if (!team) {
      throw new NotFoundException('team not found');
    }
    return await this.repository.remove(team);
  }

  async update(id: number, data: Partial<Team>): Promise<Team> {
    let team = await this.repository.findOne(id);
    if (!team) {
      throw new NotFoundException('team not found');
    }
    Object.assign(team, data);
    return await this.repository.save(team);
  }
}
