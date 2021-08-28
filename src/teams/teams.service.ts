import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
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

  async create(data: Partial<Team>, owner: User): Promise<Team> {
    const team = this.repository.create(data);
    team.owner = owner;
    team.members = [owner]; // it's a member too
    return await this.repository.save(team);
  }

  async addUser(team: Team, user: User): Promise<Team> {
    team.members.push(user);
    return await this.repository.save(team);
  }

  async remove(team: Team): Promise<Team> {
    return await this.repository.remove(team);
  }

  async update(team: Team, data: Partial<Team>): Promise<Team> {
    Object.assign(team, data);
    return await this.repository.save(team);
  }

  async addProject(team: Team, project: Project): Promise<Team> {
    if (!team.projects) {
      team.projects = [];
    }
    team.projects.push(project);
    return await this.repository.save(team);
  }
}
