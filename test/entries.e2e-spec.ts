import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { print } from 'graphql';
import gql from 'graphql-tag';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Entries E2E Tests', () => {
  let app: INestApplication;
  let access_token: string;
  const email = faker.internet.email();
  const password = '12345678';
  const name = faker.name.findName();

  let userId: string;
  let projectId: string;
  let taskId: string;
  let statusCode = 'O';
  let assignmentId: string;
  let entryId: string;

  const projectName = faker.name.title().substring(0, 20);
  const projectDesc = 'This is my Awesome project';

  const taskTitle = 'Amazing Task'; // could be duplicated
  const taskDesc = 'This is an amazing task';

  const assignmentNote = 'This is an assignment';

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

  it('create a status', async () => {
    const createStatusMutation = gql`
      mutation createStatus($data: NewStatusInput!) {
        createStatus(data: $data) {
          code
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'createStatus',
        query: print(createStatusMutation),
        variables: {
          data: {
            code: statusCode,
            label: 'Open',
            order: 1,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { createStatus },
    } = res.body;
    expect(createStatus).toBeDefined();
    expect(createStatus.code).toEqual(statusCode);
  });

  it('create an assignment', async () => {
    const createAssignmentMutation = gql`
      mutation createAssignment($data: NewAssignmentInput!) {
        createAssignment(data: $data) {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'createAssignment',
        query: print(createAssignmentMutation),
        variables: {
          data: {
            note: assignmentNote,
            deadline: new Date(2021, 9, 21, 19).toISOString(),
            taskId: taskId,
            userId: userId,
            statusCode: statusCode,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { createAssignment },
    } = res.body;
    expect(createAssignment).toBeDefined();

    assignmentId = createAssignment.id; // IMPORTANT
  });

  it('create an entry should be unauthorized', async () => {
    const createEntryMutation = gql`
      mutation createEntry($data: NewEntryInput!) {
        createEntry(data: $data) {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'createEntry',
        query: print(createEntryMutation),
        variables: {
          data: {
            assignmentId: assignmentId,
          },
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('create an entry', async () => {
    const createEntryMutation = gql`
      mutation createEntry($data: NewEntryInput!) {
        createEntry(data: $data) {
          id
          startTime
          finishTime
          user {
            id
          }
          assignment {
            id
            note
          }
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'createEntry',
        query: print(createEntryMutation),
        variables: {
          data: {
            assignmentId: assignmentId,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { createEntry },
    } = res.body;
    expect(createEntry).toBeDefined();
    expect(createEntry.startTime).toBeNull();
    expect(createEntry.finishTime).toBeNull();
    expect(createEntry.assignment).toBeDefined();
    expect(createEntry.user.id).toEqual(userId);
    expect(createEntry.assignment.id).toEqual(assignmentId);
    expect(createEntry.assignment.note).toEqual(assignmentNote);

    entryId = createEntry.id;
  });

  it('start the timer should be unauthorized', async () => {
    const startEntryMutation = gql`
      mutation startEntry($id: ID!) {
        startEntry(id: $id) {
          startTime
          finishTime
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'startEntry',
        query: print(startEntryMutation),
        variables: {
          id: entryId,
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('start the timer for a entry', async () => {
    const startEntryMutation = gql`
      mutation startEntry($id: ID!) {
        startEntry(id: $id) {
          startTime
          finishTime
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'startEntry',
        query: print(startEntryMutation),
        variables: {
          id: entryId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { startEntry },
    } = res.body;
    expect(startEntry).toBeDefined();
    expect(startEntry.startTime).toBeDefined();
    expect(startEntry.startTime).not.toBeNull();
    expect(startEntry.finishTime).toBeDefined();
    expect(startEntry.finishTime).toBeNull();
  });

  it('stop the timer should be unauthorized', async () => {
    const stopEntryMutation = gql`
      mutation stopEntry($id: ID!) {
        stopEntry(id: $id) {
          startTime
          finishTime
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'stopEntry',
        query: print(stopEntryMutation),
        variables: {
          id: entryId,
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('stop the timer for a entry', async () => {
    const stopEntryMutation = gql`
      mutation stopEntry($id: ID!) {
        stopEntry(id: $id) {
          startTime
          finishTime
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'stopEntry',
        query: print(stopEntryMutation),
        variables: {
          id: entryId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { stopEntry },
    } = res.body;
    expect(stopEntry).toBeDefined();
    expect(stopEntry.startTime).toBeDefined();
    expect(stopEntry.startTime).not.toBeNull();
    expect(stopEntry.finishTime).toBeDefined();
    expect(stopEntry.finishTime).not.toBeNull();
  });

  it('update an entry should be unauthorized', async () => {
    const updateEntryMutation = gql`
      mutation updateEntry($id: ID!, $data: UpdateEntryInput!) {
        updateEntry(id: $id, data: $data) {
          startTime
          finishTime
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'updateEntry',
        query: print(updateEntryMutation),
        variables: {
          id: entryId,
          data: {
            startTime: new Date(),
            finishTime: null,
          },
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('update an entry', async () => {
    const updateEntryMutation = gql`
      mutation updateEntry($id: ID!, $data: UpdateEntryInput!) {
        updateEntry(id: $id, data: $data) {
          startTime
          finishTime
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'updateEntry',
        query: print(updateEntryMutation),
        variables: {
          id: entryId,
          data: {
            startTime: new Date(),
            finishTime: null,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { updateEntry },
    } = res.body;
    expect(updateEntry).toBeDefined();
    expect(updateEntry.startTime).not.toBeNull();
    expect(updateEntry.finishTime).toBeNull();
  });

  it('remove an entry should be unauthorized', async () => {
    const removeEntryMutation = gql`
      mutation removeEntry($id: ID!) {
        removeEntry(id: $id) {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'removeEntry',
        query: print(removeEntryMutation),
        variables: {
          id: entryId,
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('remove an entry', async () => {
    const removeEntryMutation = gql`
      mutation removeEntry($id: ID!) {
        removeEntry(id: $id) {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'removeEntry',
        query: print(removeEntryMutation),
        variables: {
          id: entryId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { removeEntry },
    } = res.body;
    expect(removeEntry).toBeDefined();
    expect(removeEntry.id).toEqual(entryId);
  });
});
