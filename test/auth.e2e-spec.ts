import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;
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

  it('handle a signup request', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, name })
      .expect(201);
    expect(res.body.access_token).toBeDefined();
  });

  it('handle a signin request', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ username: email, password })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
  });

  it('should respond 401 unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ username: email, password: 'wrong password' })
      .expect(401);
  });
});
