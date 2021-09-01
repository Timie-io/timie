import { Test, TestingModule } from '@nestjs/testing';
import { NewStatusInput } from './dto/new-status.input';
import { Status } from './status.entity';
import { StatusResolver } from './status.resolver';
import { StatusService } from './status.service';

describe('StatusResolver', () => {
  let resolver: StatusResolver;
  let statusService: Partial<StatusService>;
  let status: Partial<Status>;

  beforeEach(async () => {
    status = {
      code: 'O',
      label: 'Open',
      order: 1,
    };

    statusService = {
      async findOneByCode(code, ...relations) {
        return status as Status;
      },
      async findAll(...relations) {
        return [status as Status];
      },
      async create(data) {
        return status as Status;
      },
      async update(input, data) {
        Object.assign(input, data);
        return input as Status;
      },
      async remove(input) {
        return input as Status;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusResolver,
        {
          provide: StatusService,
          useValue: statusService,
        },
      ],
    }).compile();

    resolver = module.get<StatusResolver>(StatusResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should find one by code', async () => {
    expect(await resolver.status('O')).toEqual(status);
  });

  it('should find all', async () => {
    expect(await resolver.statuses()).toEqual([status]);
  });

  it('should create one', async () => {
    expect(await resolver.createStatus(status as NewStatusInput)).toEqual(
      status,
    );
  });

  it('should update one', async () => {
    expect(await resolver.updateStatus('O', { label: 'In Progress' })).toEqual({
      ...status,
      label: 'In Progress',
    });
  });

  it('should remove one', async () => {
    expect(await resolver.removeStatus('O')).toEqual(status);
  });
});
