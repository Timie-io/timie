import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CurrentUser } from '../auth/current-user.decorator';
import { Team } from '../teams/team.entity';
import { User } from '../users/user.entity';
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
    return this.repository.findOne(query, { relations });
  }

  async findAll(
    skip: number,
    take: number,
    ...relations: string[]
  ): Promise<[Project[], number]> {
    return this.repository.findAndCount({
      skip: skip,
      take: take,
      relations,
    });
  }

  async findAllByName(
    name: string,
    skip: number,
    take: number,
    ...relations: string[]
  ): Promise<[Project[], number]> {
    return this.repository.findAndCount({
      where: { name: ILike(`%${name}%`) },
      skip: skip,
      take: take,
      relations,
    });
  }

  async create(
    data: Partial<Project>,
    team: Team,
    @CurrentUser() user: User,
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
