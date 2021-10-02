import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, FindManyOptions, ILike, Repository } from 'typeorm';
import { Team } from '../teams/team.entity';
import { User } from '../users/user.entity';
import { ProjectsFindArgs } from './dto/projects-find.args';
import { ProjectsViewArgs } from './dto/projects-view.args';
import { ProjectView } from './project-view.entity';
import { Project } from './project.entity';

const sortableFields = {
  name: 'project.name',
  description: 'project.description',
  owner: 'project.ownerName',
  team: 'project.teamName',
  created: 'project.created',
};

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly repository: Repository<Project>,
    @InjectRepository(ProjectView)
    private readonly projectsView: Repository<ProjectView>,
  ) {}

  async findOneById(
    id: number,
    ...relations: string[]
  ): Promise<Project | undefined> {
    const query = { id: id };
    return await this.repository.findOne(query, { relations });
  }

  async findView(args: ProjectsViewArgs): Promise<[ProjectView[], number]> {
    const query = this.projectsView.createQueryBuilder('project');
    if (args.search) {
      query.where(
        new Brackets((qb) => {
          qb.where('project.name ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('project.description ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('project.ownerName ilike :search', {
            search: `%${args.search}%`,
          });
          qb.orWhere('project.teamName ilike :search', {
            search: `%${args.search}%`,
          });
        }),
      );
    }
    if (args.active !== undefined) {
      query.andWhere('project.active = :active', { active: args.active });
    }
    if (args.ownerId) {
      query.andWhere('project.ownerId = :ownerId', {
        ownerId: Number(args.ownerId),
      });
    }
    if (args.teamId) {
      query.andWhere('project.teamId = :teamId', {
        teamId: Number(args.teamId),
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
      query.orderBy('project.id', 'DESC');
    }
    const total = await query.getCount();
    const result = await query.getMany();
    return [result, total];
  }

  async findAll(
    args: ProjectsFindArgs,
    ...relations: string[]
  ): Promise<[Project[], number]> {
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
    if (args.active !== undefined) {
      Object.assign(filter.where, { active: args.active });
    }
    if (args.ownerId) {
      Object.assign(filter.where, { ownerId: Number(args.ownerId) });
    }
    if (args.teamId) {
      Object.assign(filter.where, { teamId: Number(args.teamId) });
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
