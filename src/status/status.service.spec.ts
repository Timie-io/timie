import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockType } from '../shared/mocks/mock.type';
import { MockRepository } from '../shared/mocks/repository.mock';
import { Status } from './status.entity';
import { StatusService } from './status.service';

describe('StatusService', () => {
  let service: StatusService;
  let repository: MockType<Repository<Status>>;
  let status: Partial<Status>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusService,
        {
          provide: getRepositoryToken(Status),
          useClass: MockRepository,
        },
      ],
    }).compile();

    status = {
      code: 'O',
      label: 'Open',
      order: 1,
    };

    service = module.get<StatusService>(StatusService);
    repository = module.get(getRepositoryToken(Status));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find one by code', async () => {
    repository.findOne.mockReturnValue(status);
    expect(await service.findOneByCode('O')).toEqual(status);
  });

  it('should find all', async () => {
    repository.find.mockReturnValue([status]);
    expect(await service.findAll()).toEqual([status]);
  });

  it('should create one', async () => {
    repository.create.mockReturnValue(status);
    repository.save.mockReturnValue(status);
    expect(await service.create(status)).toEqual(status);
  });

  it('should update one', async () => {
    const update = { label: 'In Progress' };
    const updatedData = { ...status, ...update };
    repository.save.mockReturnValue(updatedData);
    expect(await service.update(status as Status, update)).toEqual(updatedData);
  });

  it('should remove one', async () => {
    repository.remove.mockReturnValue(status);
    expect(await service.remove(status as Status)).toEqual(status);
  });
});
