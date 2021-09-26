import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { print } from 'graphql';
import gql from 'graphql-tag';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Comments E2E Tests', () => {
  let app: INestApplication;
  let access_token: string;
  const email = faker.internet.email();
  const password = '12345678';
  const name = faker.name.findName();

  let userId: string;
  let projectId: string;
  let taskId: string;
  let commentId: string;

  const projectName = faker.name.title().substring(0, 20);
  const projectDesc = 'This is my Awesome project';

  const taskTitle = 'Amazing Task'; // could be duplicated
  const taskDesc = 'This is an amazing task';

  let commentBody = 'This is a comment';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('signup a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, name, isAdmin: false })
      .expect(201);
    access_token = res.body.access_token;
    expect(access_token).toBeDefined();
  });

  it('create a project', async () => {
    const createProjectMutation = gql`
      mutation createProject($data: NewProjectInput!) {
        createProject(data: $data) {
          id
          owner {
            id
          }
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'createProject',
        query: print(createProjectMutation),
        variables: {
          data: {
            name: projectName,
            description: projectDesc,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { createProject },
    } = res.body;
    userId = createProject.owner.id; // IMPORTANT
    projectId = createProject.id; // IMPORTANT
  });

  it('create a task', async () => {
    const createTaskMutation = gql`
      mutation createTask($data: NewTaskInput!) {
        createTask(data: $data) {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'createTask',
        query: print(createTaskMutation),
        variables: {
          data: {
            title: taskTitle,
            description: taskDesc,
            projectId: projectId,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { createTask },
    } = res.body;
    expect(createTask).toBeDefined();

    taskId = createTask.id; // IMPORTANT
  });

  it('create a comment should be unauthorized', async () => {
    const createCommentMutation = gql`
      mutation createComment($taskId: ID!, $data: NewCommentInput!) {
        createComment(taskId: $taskId, data: $data) {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'createComment',
        query: print(createCommentMutation),
        variables: {
          taskId: taskId,
          data: {
            body: commentBody,
          },
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('create a comment', async () => {
    const createCommentMutation = gql`
      mutation createComment($taskId: ID!, $data: NewCommentInput!) {
        createComment(taskId: $taskId, data: $data) {
          id
          body
          task {
            id
          }
          user {
            id
          }
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'createComment',
        query: print(createCommentMutation),
        variables: {
          taskId: taskId,
          data: {
            body: commentBody,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { createComment },
    } = res.body;
    expect(createComment).toBeDefined();
    expect(createComment.body).toEqual(commentBody);
    expect(createComment.task).toBeDefined();
    expect(createComment.task.id).toEqual(taskId);
    expect(createComment.user).toBeDefined();
    expect(createComment.user.id).toEqual(userId);

    commentId = createComment.id; // IMPORTANT
  });

  it('get a comment should be unauthorized', async () => {
    const getCommentQuery = gql`
      query getComment($id: ID!) {
        comment(id: $id) {
          body
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'getComment',
        query: print(getCommentQuery),
        variables: {
          id: commentId,
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('get a comment by ID', async () => {
    const getCommentQuery = gql`
      query getComment($id: ID!) {
        comment(id: $id) {
          body
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'getComment',
        query: print(getCommentQuery),
        variables: {
          id: commentId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { comment },
    } = res.body;
    expect(comment).toBeDefined();
    expect(comment.body).toEqual(commentBody);
  });

  it('get all comments should be unauthorized', async () => {
    const getAllCommentsQuery = gql`
      query getAllComments($taskId: ID!) {
        comments(taskId: $taskId) {
          total
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'getAllComments',
        query: print(getAllCommentsQuery),
        variables: {
          taskId: taskId,
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('get all comments', async () => {
    const getAllCommentsQuery = gql`
      query getAllComments($taskId: ID!) {
        comments(taskId: $taskId) {
          result {
            id
          }
          total
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'getAllComments',
        query: print(getAllCommentsQuery),
        variables: {
          taskId: taskId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { comments },
    } = res.body;
    expect(comments).toBeDefined();
    expect(comments.total).toEqual(1);
    expect(comments.result).toHaveLength(1);
    expect(comments.result[0].id).toEqual(commentId);
  });

  it('update a comment should be unauthorized', async () => {
    const updateCommentMutation = gql`
      mutation updateComment($id: ID!, $data: UpdateCommentInput!) {
        updateComment(id: $id, data: $data) {
          body
        }
      }
    `;
    const newBody = 'This comment has been updated';
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'updateComment',
        query: print(updateCommentMutation),
        variables: {
          id: commentId,
          data: {
            body: newBody,
          },
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('update a comment', async () => {
    const updateCommentMutation = gql`
      mutation updateComment($id: ID!, $data: UpdateCommentInput!) {
        updateComment(id: $id, data: $data) {
          body
        }
      }
    `;
    const newBody = 'This comment has been updated';
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'updateComment',
        query: print(updateCommentMutation),
        variables: {
          id: commentId,
          data: {
            body: newBody,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { updateComment },
    } = res.body;
    expect(updateComment).toBeDefined();
    expect(updateComment.body).toEqual(newBody);

    commentBody = newBody;
  });

  it('remove a comment shuld be unauthorized', async () => {
    const removeCommentMutation = gql`
      mutation removeComment($id: ID!) {
        removeComment(id: $id) {
          body
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'removeComment',
        query: print(removeCommentMutation),
        variables: {
          id: commentId,
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('remove a comment', async () => {
    const removeCommentMutation = gql`
      mutation removeComment($id: ID!) {
        removeComment(id: $id) {
          body
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'removeComment',
        query: print(removeCommentMutation),
        variables: {
          id: commentId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { removeComment },
    } = res.body;
    expect(removeComment).toBeDefined();
    expect(removeComment.body).toEqual(commentBody);
  });
});
