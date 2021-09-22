import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockType } from '../shared/mocks/mock.type';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { MockRepository } from './../shared/mocks/repository.mock';
import { Comment } from './comment.entity';
import { CommentsService } from './comments.service';
import { CommentsFindArgs } from './dto/comments-find.args';

describe('CommentsService', () => {
  let service: CommentsService;
  let repository: MockType<Repository<Comment>>;
  let user: Partial<User>;
  let task: Partial<Task>;
  let comment: Partial<Comment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useClass: MockRepository,
        },
      ],
    }).compile();

    user = {
      id: 1,
      email: 'user@mail.com',
      name: 'User',
    };

    task = {
      id: 1,
      title: 'This is a task',
    };

    comment = {
      id: 1,
      task: task as Task,
      user: user as User,
      body: 'This is a comment',
    };

    service = module.get<CommentsService>(CommentsService);
    repository = module.get(getRepositoryToken(Comment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find one by ID', async () => {
    repository.findOne.mockReturnValue(comment);
    expect(await service.findOneById(1)).toEqual(comment);
  });

  it('should find all', async () => {
    const output = [[comment as Comment], 1];
    repository.findAndCount.mockReturnValue(output);
    expect(await service.findAll({} as CommentsFindArgs)).toEqual(output);
  });

  it('should create a new one', async () => {
    repository.create.mockReturnValue(comment);
    repository.save.mockReturnValue(comment);
    expect(await service.create(comment, task as Task, user as User)).toEqual(
      comment,
    );
  });

  it('should update one', async () => {
    const newBody = 'This comment has a new body';
    const commentUpdated = { ...comment, body: newBody };
    repository.save.mockReturnValue(commentUpdated);
    expect(await service.update(comment as Comment, { body: newBody })).toEqual(
      commentUpdated,
    );
    expect(comment).toEqual(commentUpdated);
  });

  it('should remove one', async () => {
    repository.remove.mockReturnValue(comment);
    expect(await service.remove(comment as Comment)).toEqual(comment);
  });
});
