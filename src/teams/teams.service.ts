import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { TeamsFindArgs } from './dto/teams-find.args';
import { TeamsViewArgs } from './dto/teams-view.args';
import { TeamView } from './models/team-view.model';
import { Team } from './team.entity';
import { TeamsView } from './teams.view-entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private readonly repository: Repository<Team>,
    @InjectRepository(TeamsView)
    private readonly teamsView: Repository<TeamsView>,
  ) {}

  async findView(args: TeamsViewArgs): Promise<[TeamView[], number]> {
    return [[], 0];
  }

  async findAll(
    args: TeamsFindArgs,
    ...relations: string[]
  ): Promise<[Team[], number]> {
    const filter = {
      where: {},
      skip: args.skip,
      take: args.take,
      order: {
        id: 'DESC',
      },
      relations,
    } as FindManyOptions;
    if (args.name) {
      Object.assign(filter.where, { name: ILike(`%${args.name}%`) });
    }
    if (args.ownerId) {
      Object.assign(filter.where, { ownerId: Number(args.ownerId) });
    }
    return await this.repository.findAndCount(filter);
  }

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

  async addMember(team: Team, user: User): Promise<Team> {
    team.members.push(user);
    return await this.repository.save(team);
  }

  async removeMember(team: Team, user: User): Promise<Team> {
    team.members = team.members.filter((member) => member.id !== user.id);
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
