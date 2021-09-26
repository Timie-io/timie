import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import gql from 'graphql-tag';
import { print } from 'graphql/language/printer';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Users E2E Tests', () => {
  let app: INestApplication;
  let access_token: string;
  let userId = '';
  const email = faker.internet.email();
  const password = '12345678';
  const name = faker.name.findName();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const getUserByIdQuery = gql`
    query getUserById($id: ID!) {
      user(id: $id) {
        id
        name
        email
        isAdmin
        creationDate
      }
    }
  `;

  const getLoggedUserQuery = gql`
    {
      loggedUser {
        id
        name
        email
        isAdmin
        creationDate
      }
    }
  `;

  it('signup a user', async () => {
    // The user should be Admin to run the following tests successful
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, name, isAdmin: true })
      .expect(201);
    access_token = res.body.access_token;
    expect(access_token).toBeDefined();
  });

  it('query the current logged user', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: null,
        query: print(getLoggedUserQuery),
      })
      .expect(200);
    const {
      data: { loggedUser },
    } = res.body;
    expect(loggedUser.id).toBeDefined();
    expect(loggedUser.email).toEqual(email);
    expect(loggedUser.name).toEqual(name);

    userId = loggedUser.id;
  });

  it('query a user by id should be unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'getUserById',
        query: print(getUserByIdQuery),
        variables: {
          id: '1',
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('query a user by id', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'getUserById',
        query: print(getUserByIdQuery),
        variables: {
          id: userId,
        },
      });
    const {
      data: { user },
    } = res.body;
    expect(user).toBeDefined();
    expect(typeof user.email).toBe('string');
    expect(user.id).toEqual(userId);
  });

  it('list all users should be unauthorized', async () => {
    const getAllUsersQuery = gql`
      query GetAllUsers {
        users {
          id
          name
          email
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'GetAllUsers',
        query: print(getAllUsersQuery),
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('list all users', async () => {
    const getAllUsersQuery = gql`
      query GetAllUsers {
        users {
          id
          name
          email
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'GetAllUsers',
        query: print(getAllUsersQuery),
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { users },
    } = res.body;
    expect(users.length).toBeGreaterThan(0);
  });

  it('update the user password should be unauthorized', async () => {
    const updateUserPasswordMutation = gql`
      mutation updateUserPassword($data: UpdatePasswordInput!) {
        updateUserPassword(data: $data) {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'updateUserPassword',
        query: print(updateUserPasswordMutation),
        variables: {
          data: { password: 'thispasswordischanged' },
        },
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('update the user password', async () => {
    const updateUserPasswordMutation = gql`
      mutation updateUserPassword($data: UpdatePasswordInput!) {
        updateUserPassword(data: $data) {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'updateUserPassword',
        query: print(updateUserPasswordMutation),
        variables: {
          data: { password: 'thispasswordischanged' },
        },
      });
    expect(res.body.data).toBeDefined();
    const { updateUserPassword } = res.body.data;
    expect(updateUserPassword.id).toEqual(userId);
  });

  it('remove the user should be unauthorized', async () => {
    const removeUserMutation = gql`
      mutation removeUser {
        removeUser {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: 'removeUser',
        query: print(removeUserMutation),
      });
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toEqual('Unauthorized');
  });

  it('remove the user', async () => {
    const removeUserMutation = gql`
      mutation removeUser {
        removeUser {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'removeUser',
        query: print(removeUserMutation),
      });
    expect(res.body.data).toBeDefined();
    const { removeUser } = res.body.data;
    expect(removeUser.id).toEqual(userId);
  });
});
