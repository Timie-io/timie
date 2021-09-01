import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Team } from '../teams/team.entity';
import { User } from '../users/user.entity';
import { ProjectsFindArgs } from './dto/projects-find.args';
import { Project } from './project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly repository: Repository<Project>,
  ) {}

  async findOneById(
    id: number,
    ...relations: string[]
  ): Promise<Project | undefined> {
    const query = { id: id };
    return await this.repository.findOne(query, { relations });
  }

  async findAll(
    args: ProjectsFindArgs,
    ...relations: string[]
  ): Promise<[Project[], number]> {
    const filter = {
      where: {},
      skip: args.skip,
      take: args.take,
      relations,
    };
    if (args.name) {
      Object.assign(filter.where, { name: ILike(`%${args.name}%`) });
    }
    if (args.ownerId) {
      Object.assign(filter.where, { ownerId: args.ownerId });
    }
    if (args.teamId) {
      Object.assign(filter.where, { teamId: args.teamId });
    }
    return await this.repository.findAndCount(filter);
  }

  async create(
    data: Partial<Project>,
    team: Team,
    user: User,
  ): Promise<Project> {
    const project = this.repository.create(data);
    project.owner = user;
    project.team = team;
    return await this.repository.save(project);
  }

  async remove(project: Project): Promise<Project> {
    return await this.repository.remove(project);
  }

  async update(project: Project, data: Partial<Project>): Promise<Project> {
    Object.assign(project, data);
    return await this.repository.save(project);
  }
}
