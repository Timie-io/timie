import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;
  const email = faker.internet.email();
  const password = '12345678';
  const name = faker.name.findName();

  let access_token: string;
  let refresh_token: string;
  let old_access_token: string;

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
    expect(res.body.refresh_token).toBeDefined();
  });

  it('handle a signin request', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ username: email, password })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();

    access_token = res.body.access_token;
    refresh_token = res.body.refresh_token;
  });

  it('should respond 401 unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ username: email, password: 'wrong password' })
      .expect(401);
  });

  it('should refresh token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refresh_token}`)
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();

    old_access_token = access_token;
    access_token = res.body.access_token;
    refresh_token = res.body.refresh_token;
  });

  it('the old access token should not work', async () => {
    await request(app.getHttpServer())
      .get('/auth/logout')
      .set('Authorization', `Bearer ${old_access_token}`)
      .expect(401);
  });

  it('should logout', async () => {
    await request(app.getHttpServer())
      .get('/auth/logout')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200);
  });

  it('should be logged out', async () => {
    await request(app.getHttpServer())
      .get('/auth/logout')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(401);
  });
});
