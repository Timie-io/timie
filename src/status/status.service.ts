import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status } from './status.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(Status) private readonly repository: Repository<Status>,
  ) {}

  async findOneByCode(
    code: string,
    ...relations: string[]
  ): Promise<Status | undefined> {
    return await this.repository.findOne({ code }, { relations });
  }

  async findAll(...relations: string[]): Promise<Status[]> {
    return await this.repository.find({ relations });
  }

  async create(data: Partial<Status>): Promise<Status> {
    const status = this.repository.create(data);
    return this.repository.save(data);
  }

  async update(status: Status, data: Partial<Status>): Promise<Status> {
    Object.assign(status, data);
    return this.repository.save(status);
  }

  async remove(status: Status): Promise<Status> {
    return await this.repository.remove(status);
  }
}
