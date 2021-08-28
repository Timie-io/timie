import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Team } from '../teams/team.entity';
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

  async create(data: Partial<Project>, owner: Team): Promise<Project> {
    const project = this.repository.create(data);
    project.owner = owner;
    project.teams = [owner];
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
