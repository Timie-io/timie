import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { print } from 'graphql';
import gql from 'graphql-tag';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Status E2E Tests', () => {
  let app: INestApplication;
  let access_token: string;
  const email = faker.internet.email();
  const password = '12345678';
  const name = faker.name.findName();

  const statusCode = 'P';
  let statusLabel = 'In Progress';
  const statusOrder = 2;

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

  it('create a status should be unauthorized', async () => {
    const createStatusMutation = gql`
      mutation createStatus($data: NewStatusInput!) {
        createStatus(data: $data) {
          code
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'createStatus',
        query: print(createStatusMutation),
        variables: {
          data: {
            code: statusCode,
            label: statusLabel,
            order: statusOrder,
          },
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('create a status', async () => {
    const createStatusMutation = gql`
      mutation createStatus($data: NewStatusInput!) {
        createStatus(data: $data) {
          code
          label
          order
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
            label: statusLabel,
            order: statusOrder,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { createStatus },
    } = res.body;
    expect(createStatus.code).toEqual(statusCode);
    expect(createStatus.label).toEqual(statusLabel);
    expect(createStatus.order).toEqual(statusOrder);
  });

  it('find a status should be unauthorized', async () => {
    const getStatusQuery = gql`
      query getStatus($code: ID!) {
        status(code: $code) {
          label
          order
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'getStatus',
        query: print(getStatusQuery),
        variables: {
          code: statusCode,
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('find a status by code', async () => {
    const getStatusQuery = gql`
      query getStatus($code: ID!) {
        status(code: $code) {
          label
          order
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'getStatus',
        query: print(getStatusQuery),
        variables: {
          code: statusCode,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { status },
    } = res.body;
    expect(status.label).toEqual(statusLabel);
    expect(status.order).toEqual(statusOrder);
  });

  it('find all status should be unauthorized', async () => {
    const getAllStatusQuery = gql`
      {
        statuses {
          code
          label
          order
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        query: print(getAllStatusQuery),
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('find all status', async () => {
    const getAllStatusQuery = gql`
      {
        statuses {
          code
          label
          order
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: null,
        query: print(getAllStatusQuery),
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { statuses },
    } = res.body;
    expect(statuses).toBeDefined();
    expect(statuses.length).toBeGreaterThan(0);
  });

  it('update a status should be unauthorized', async () => {
    const updateStatusMutation = gql`
      mutation updateStatus($code: ID!, $data: UpdateStatusInput!) {
        updateStatus(code: $code, data: $data) {
          label
        }
      }
    `;
    statusLabel = 'In Progress';
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'updateStatus',
        query: print(updateStatusMutation),
        variables: {
          code: statusCode,
          data: {
            label: statusLabel,
          },
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('update status', async () => {
    const updateStatusMutation = gql`
      mutation updateStatus($code: ID!, $data: UpdateStatusInput!) {
        updateStatus(code: $code, data: $data) {
          label
        }
      }
    `;
    statusLabel = 'In Progress';
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'updateStatus',
        query: print(updateStatusMutation),
        variables: {
          code: statusCode,
          data: {
            label: statusLabel,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { updateStatus },
    } = res.body;
    expect(updateStatus).toBeDefined();
    expect(updateStatus.label).toEqual(statusLabel);
  });

  it('remove a status should be unauthorized', async () => {
    const removeStatusMutation = gql`
      mutation removeStatus($code: ID!) {
        removeStatus(code: $code) {
          code
          label
          order
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'removeStatus',
        query: print(removeStatusMutation),
        variables: {
          code: statusCode,
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('remove status', async () => {
    const removeStatusMutation = gql`
      mutation removeStatus($code: ID!) {
        removeStatus(code: $code) {
          code
          label
          order
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'removeStatus',
        query: print(removeStatusMutation),
        variables: {
          code: statusCode,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { removeStatus },
    } = res.body;
    expect(removeStatus).toBeDefined();
    expect(removeStatus.code).toEqual(statusCode);
    expect(removeStatus.label).toEqual(statusLabel);
    expect(removeStatus.order).toEqual(statusOrder);
  });
});
