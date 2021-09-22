import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Task } from '../tasks/task.entity';
import { User as UserModel } from '../users/models/user.model';
import { User } from '../users/user.entity';
import { TasksService } from './../tasks/tasks.service';
import { UsersService } from './../users/users.service';
import { Comment } from './comment.entity';
import { CommentsResolver } from './comments.resolver';
import { CommentsService } from './comments.service';
import { CommentsFindArgs } from './dto/comments-find.args';
import { NewCommentInput } from './dto/new-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';

describe('CommentsResolver', () => {
  let resolver: CommentsResolver;
  let usersService: Partial<UsersService>;
  let tasksService: Partial<TasksService>;
  let commentsService: Partial<CommentsService>;
  let user: Partial<User>;
  let userModel: Partial<UserModel>;
  let task: Partial<Task>;
  let comment: Partial<Comment>;

  beforeEach(async () => {
    user = {
      id: 1,
      name: 'User Name',
      email: 'user@mail.com',
      isAdmin: false,
      creationDate: new Date(),
      password: 'hashedpassword',
      ownedTeams: [],
      teams: [],
    };

    userModel = {
      ...user,
      id: '1',
      ownedTeams: [],
      teams: [],
      tasks: [],
      myTasks: [],
      assignments: [],
      entries: [],
      comments: [],
    } as UserModel;

    task = {
      id: 1,
      title: 'This is a task',
    };

    comment = {
      user: user as User,
      userId: user.id,
      task: task as Task,
      taskId: task.id,
      body: 'This is a comment',
    };

    usersService = {
      async findOneById(id: number, ...relations: string[]): Promise<User> {
        return user as User;
      },
    };

    tasksService = {
      async findOneById(id: number, ...relations: string[]): Promise<Task> {
        return task as Task;
      },
    };

    commentsService = {
      async findOneById(id: number, ...relations: string[]): Promise<Comment> {
        return comment as Comment;
      },

      async findAll(args, ...relations) {
        return [[comment as Comment], 1];
      },

      async create(data, task, user) {
        return comment as Comment;
      },

      async update(comment, data) {
        return comment as Comment;
      },

      async remove(comment) {
        return comment as Comment;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsResolver,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: TasksService,
          useValue: tasksService,
        },
        {
          provide: CommentsService,
          useValue: commentsService,
        },
      ],
    }).compile();

    resolver = module.get<CommentsResolver>(CommentsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should create one', async () => {
    expect(
      await resolver.createComment(
        { body: 'This is a task' } as NewCommentInput,
        '1',
        userModel as UserModel,
      ),
    ).toEqual(comment);
  });

  it('should update one', async () => {
    expect(
      await resolver.updateComment(
        '1',
        {} as UpdateCommentInput,
        userModel as UserModel,
      ),
    ).toEqual(comment);
  });

  it('updating should throw a not allowed exception', async () => {
    const newUserModel = { ...userModel, id: '2' };
    try {
      await resolver.updateComment(
        '1',
        {} as UpdateCommentInput,
        newUserModel as UserModel,
      );
      throw new Error('No throw exception');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('should remove one', async () => {
    expect(await resolver.removeComment('1', userModel as UserModel)).toEqual(
      comment,
    );
  });

  it('removing should throw a not allowed exception', async () => {
    const newUserModel = { ...userModel, id: '2' };
    try {
      await resolver.removeComment('1', newUserModel as UserModel);
      throw new Error('No throw exception');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('should find one', async () => {
    expect(await resolver.comment('1')).toEqual(comment);
  });

  it('should find all', async () => {
    expect(await resolver.comments({} as CommentsFindArgs)).toEqual({
      result: [comment as Comment],
      total: 1,
    });
  });
});
