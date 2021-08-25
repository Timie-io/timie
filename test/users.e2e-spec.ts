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
  const email = faker.internet.email();
  const password = '1234';
  const name = faker.name.findName();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const getUserByIdQuery = gql`
    query getUserById($id: String!) {
      getUserById(id: $id) {
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
      getLoggedUser {
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
    console.log(res.body);
    const {
      data: { getLoggedUser },
    } = res.body;
    expect(getLoggedUser.id).toBeDefined();
    expect(getLoggedUser.email).toEqual(email);
    expect(getLoggedUser.name).toEqual(name);
  });

  it('query a user by id', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'getUserById',
        query: print(getUserByIdQuery),
        variables: {
          id: '5',
        },
      });
    const {
      data: { getUserById },
    } = res.body;
    expect(getUserById).toBeDefined();
    expect(typeof getUserById.email).toBe('string');
    expect(getUserById.id).toEqual('5');
  });
});
