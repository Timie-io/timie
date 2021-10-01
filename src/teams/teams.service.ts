import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, FindManyOptions, ILike, Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { TeamsFindArgs } from './dto/teams-find.args';
import { TeamsViewArgs } from './dto/teams-view.args';
import { TeamView } from './team-view.entity';
import { Team } from './team.entity';

const sortableFields = {
  name: 'team.name',
  description: 'team.description',
  owner: 'team.ownerName',
};

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private readonly repository: Repository<Team>,
    @InjectRepository(TeamView)
    private readonly teamsView: Repository<TeamView>,
  ) {}

  async findView(args: TeamsViewArgs): Promise<[TeamView[], number]> {
    let query = this.teamsView.createQueryBuilder('team');
    if (args.search) {
      query.where(
        new Brackets((qb) => {
          qb.where('team.name ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('team.description ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('team.ownerName ilike :search', {
            search: `%${args.search}%`,
          });
        }),
      );
    }
    if (args.ownerId) {
      query.andWhere('team.ownerId = :ownerId', {
        ownerId: args.ownerId,
      });
    }
    if (args.skip) {
      query.skip(args.skip);
    }
    if (args.take) {
      query.take(args.take);
    }
    if (args.sortBy) {
      for (let sort of args.sortBy) {
        if (sort.columnName in sortableFields) {
          query.addOrderBy(sortableFields[sort.columnName], sort.sortType);
        }
      }
    } else {
      query.orderBy('team.id', 'DESC');
    }

    const total = await query.getCount();
    const result = await query.getMany();
    return [result, total];
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
