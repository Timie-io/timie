import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockType } from '../shared/mocks/mock.type';
import { MockRepository } from '../shared/mocks/repository.mock';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockType<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = {
      id: undefined,
      password: undefined,
      isAdmin: undefined,
      creationDate: undefined,
      name: 'Steven Taylor',
      email: 'staylor@mail.com',
    } as User;
    const finalUser = {
      ...user,
      id: 1,
      creationDate: new Date(),
      isAdmin: false,
      password: 'somehashedpassword',
    } as User;
    repository.create.mockReturnValue(user);
    repository.save.mockReturnValue(finalUser);
    expect(await service.create(user)).toEqual(finalUser);
  });

  it('should find one user by ID', async () => {
    const user = {
      id: 1,
      name: 'Steven Taylor',
      email: 'staylor@mail.com',
      creationDate: new Date(),
      isAdmin: false,
      password: 'somehashedpassword',
    } as User;
    repository.findOne.mockReturnValue(user);
    expect(await service.findOneById(1)).toEqual(user);
  });

  it('should find one user by email address', async () => {
    const user = {
      id: 1,
      name: 'Steven Taylor',
      email: 'staylor@mail.com',
      creationDate: new Date(),
      isAdmin: false,
      password: 'somehashedpassword',
    } as User;
    repository.findOne.mockReturnValue(user);
    expect(await service.findOneByEmail('staylor@mail.com')).toEqual(user);
  });
});
