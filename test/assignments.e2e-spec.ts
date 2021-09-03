import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { print } from 'graphql';
import gql from 'graphql-tag';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Teams E2E Tests', () => {
  let app: INestApplication;
  let access_token: string;
  const email = faker.internet.email();
  const password = '1234';
  const name = faker.name.findName();

  let userId: string;
  let projectId: string;
  let taskId: string;
  let statusCode = 'O';
  let assignmentId: string;

  const projectName = faker.name.title();
  const projectDesc = 'This is my Awesome project';

  const taskTitle = 'Amazing Task'; // could be duplicated
  const taskDesc = 'This is an amazing task';

  let assignmentTitle = 'Assignment'; // could be duplicated
  const assignmentDesc = 'This is an assignment';

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
          title
          description
          status {
            code
          }
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
        operationName: 'createAssignment',
        query: print(createAssignmentMutation),
        variables: {
          data: {
            title: assignmentTitle,
            description: assignmentDesc,
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
    expect(createAssignment.title).toEqual(assignmentTitle);
    expect(createAssignment.description).toEqual(assignmentDesc);
    expect(createAssignment.status).toBeDefined();
    expect(createAssignment.status.code).toEqual(statusCode);
    expect(createAssignment.task).toBeDefined();
    expect(createAssignment.task.id).toEqual(taskId);
    expect(createAssignment.user).toBeDefined();
    expect(createAssignment.user.id).toEqual(userId);

    assignmentId = createAssignment.id; // IMPORTANT
  });

  it('get an assignment by ID', async () => {
    const getAssignmentQuery = gql`
      query getAssignment($id: ID!) {
        assignment(id: $id) {
          title
          description
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'getAssignment',
        query: print(getAssignmentQuery),
        variables: {
          id: assignmentId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { assignment },
    } = res.body;
    expect(assignment).toBeDefined();
    expect(assignment.title).toEqual(assignmentTitle);
    expect(assignment.description).toEqual(assignmentDesc);
  });

  it('get all assignments', async () => {
    const getAllAssignmentsQuery = gql`
      query getAllAssignments($taskId: ID!) {
        assignments(taskId: $taskId) {
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
        operationName: 'getAllAssignments',
        query: print(getAllAssignmentsQuery),
        variables: {
          taskId: taskId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { assignments },
    } = res.body;
    expect(assignments).toBeDefined();
    expect(assignments.total).toEqual(1);
    expect(assignments.result).toHaveLength(1);
    expect(assignments.result[0].id).toEqual(assignmentId);
  });

  it('update an assignment', async () => {
    const updateAssignmentMutation = gql`
      mutation updateAssignment($id: ID!, $data: UpdateAssignmentInput!) {
        updateAssignment(id: $id, data: $data) {
          title
        }
      }
    `;
    const newTitle = 'This Title has been updated';
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'updateAssignment',
        query: print(updateAssignmentMutation),
        variables: {
          id: assignmentId,
          data: {
            title: newTitle,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { updateAssignment },
    } = res.body;
    expect(updateAssignment).toBeDefined();
    expect(updateAssignment.title).toEqual(newTitle);

    assignmentTitle = newTitle;
  });

  it('remove an assignment', async () => {
    const removeAssignmentMutation = gql`
      mutation removeAssignment($id: ID!) {
        removeAssignment(id: $id) {
          title
          description
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'removeAssignment',
        query: print(removeAssignmentMutation),
        variables: {
          id: assignmentId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { removeAssignment },
    } = res.body;
    expect(removeAssignment).toBeDefined();
    expect(removeAssignment.title).toEqual(assignmentTitle);
    expect(removeAssignment.description).toEqual(assignmentDesc);
  });
});
