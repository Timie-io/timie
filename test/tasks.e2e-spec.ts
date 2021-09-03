import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { print } from 'graphql';
import gql from 'graphql-tag';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Tasks E2E Tests', () => {
  let app: INestApplication;
  let access_token: string;
  const email = faker.internet.email();
  const password = '1234';
  const name = faker.name.findName();

  let userId: string;
  let projectId: string;
  let taskId: string;

  const projectName = faker.name.title();
  const projectDesc = 'This is my Awesome project';

  const taskTitle = 'Amazing Task'; // could be duplicated
  let taskDesc = 'This is an amazing task';

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
          title
          description
          priority
          creationDate
          active
          project {
            id
          }
          creator {
            id
          }
          followers {
            id
          }
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
    expect(createTask.id).toBeDefined();
    expect(createTask.title).toEqual(taskTitle);
    expect(createTask.description).toEqual(taskDesc);
    expect(createTask.priority).toEqual(0);
    expect(createTask.active).toEqual(true);
    expect(createTask.creationDate).toBeDefined();
    expect(createTask.project).toBeDefined();
    expect(createTask.project.id).toEqual(projectId);
    expect(createTask.creator).toBeDefined();
    expect(createTask.creator.id).toEqual(userId);
    expect(createTask.followers).toBeDefined();
    expect(createTask.followers).toHaveLength(1);
    expect(createTask.followers[0].id).toEqual(userId);

    taskId = createTask.id; // IMPORTANT
  });

  it('get a task by ID', async () => {
    const getTaskQuery = gql`
      query getTask($id: ID!) {
        task(id: $id) {
          title
          description
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'getTask',
        query: print(getTaskQuery),
        variables: {
          id: taskId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { task },
    } = res.body;
    expect(task).toBeDefined();
    expect(task.title).toEqual(taskTitle);
    expect(task.description).toEqual(taskDesc);
  });

  it('get a list of tasks', async () => {
    const getAllTasksQuery = gql`
      query getProjectTasks($projectId: ID) {
        tasks(projectId: $projectId) {
          result {
            id
            title
            description
          }
          total
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'getProjectTasks',
        query: print(getAllTasksQuery),
        variables: {
          projectId: projectId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { tasks },
    } = res.body;
    expect(tasks).toBeDefined();
    expect(tasks.result).toBeDefined();
    expect(tasks.total).toBeDefined();
    expect(tasks.total).toEqual(1);
    expect(tasks.result).toHaveLength(1);
    expect(tasks.result[0].id).toEqual(taskId);
    expect(tasks.result[0].title).toEqual(taskTitle);
    expect(tasks.result[0].description).toEqual(taskDesc);
  });

  it('update a task', async () => {
    const updateTaskMutation = gql`
      mutation updateTask($id: ID!, $data: UpdateTaskInput!) {
        updateTask(id: $id, data: $data) {
          title
          description
        }
      }
    `;
    const newDesc = 'The task description has been updated';
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'updateTask',
        query: print(updateTaskMutation),
        variables: {
          id: taskId,
          data: {
            description: newDesc,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { updateTask },
    } = res.body;
    expect(updateTask).toBeDefined();
    expect(updateTask.title).toEqual(taskTitle);
    expect(updateTask.description).toEqual(newDesc);

    taskDesc = newDesc; // IMPORTANT
  });

  it('add a task follower', async () => {
    const addFollowerMutation = gql`
      mutation addTaskFollower($id: ID!, $userId: ID!) {
        addTaskFollower(id: $id, userId: $userId) {
          title
          description
          followers {
            id
          }
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'addTaskFollower',
        query: print(addFollowerMutation),
        variables: {
          id: taskId,
          userId: userId, // it should already be a follower... not very effective I know
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { addTaskFollower },
    } = res.body;
    expect(addTaskFollower).toBeDefined();
    expect(addTaskFollower.title).toEqual(taskTitle);
    expect(addTaskFollower.description).toEqual(taskDesc);
    expect(addTaskFollower.followers).toBeDefined();
    expect(addTaskFollower.followers).toHaveLength(1);
  });

  it('remove a task', async () => {
    const removeTaskMutation = gql`
      mutation removeTask($id: ID!) {
        removeTask(id: $id) {
          id
          title
          description
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'removeTask',
        query: print(removeTaskMutation),
        variables: {
          id: taskId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { removeTask },
    } = res.body;
    expect(removeTask).toBeDefined();
    expect(removeTask.id).toEqual(taskId);
    expect(removeTask.title).toEqual(taskTitle);
    expect(removeTask.description).toEqual(taskDesc);
  });
});
