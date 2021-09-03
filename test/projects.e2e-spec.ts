import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { print } from 'graphql';
import gql from 'graphql-tag';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Projects E2E Tests', () => {
  let app: INestApplication;
  let access_token: string;
  const email = faker.internet.email();
  const password = '1234';
  const name = faker.name.findName();

  let userId: string;
  let projectId: string;
  const projectName = faker.name.title();
  const projectDesc = 'This is my Awesome project';

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
          name
          description
          owner {
            id
            email
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
    expect(createProject).toBeDefined();
    expect(createProject.id).toBeDefined();
    expect(createProject.name).toEqual(projectName);
    expect(createProject.description).toEqual(projectDesc);

    userId = createProject.owner.id; // IMPORTANT
    projectId = createProject.id; // IMPORTANT
  });

  it('get a project by ID', async () => {
    const getProjectQuery = gql`
      query getProject($id: ID!) {
        project(id: $id) {
          id
          name
          description
          owner {
            email
          }
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'getProject',
        query: print(getProjectQuery),
        variables: {
          id: projectId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { project },
    } = res.body;
    expect(project.id).toEqual(projectId);
    expect(project.name).toEqual(projectName);
    expect(project.description).toEqual(projectDesc);
    expect(project.owner.email).toEqual(email);
  });

  it('get all projects', async () => {
    const getAllProjectsQuery = gql`
      {
        projects {
          result {
            id
            name
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
        operationName: null,
        query: print(getAllProjectsQuery),
      });
    expect(res.body.data).toBeDefined();
    const {
      data: {
        projects: { result, total },
      },
    } = res.body;
    expect(result[0].id).toBeDefined();
    expect(result[0].name).toBeDefined();
    expect(result[0].description).toEqual(projectDesc);
    expect(total).toBeGreaterThan(0);
  });

  it('get my projects', async () => {
    const getMyProjectsQuery = gql`
      {
        myProjects {
          id
          name
          description
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
        operationName: null,
        query: print(getMyProjectsQuery),
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { myProjects },
    } = res.body;
    expect(myProjects).toBeDefined();
    expect(myProjects[0].id).toEqual(projectId);
    expect(myProjects[0].name).toEqual(projectName);
    expect(myProjects[0].description).toEqual(projectDesc);
    expect(myProjects[0].owner.id).toEqual(userId);
  });

  it('update project', async () => {
    const updateProjectMutation = gql`
      mutation updateProject($id: ID!, $data: UpdateProjectInput!) {
        updateProject(id: $id, data: $data) {
          id
          name
          description
        }
      }
    `;
    const newDesc = 'This project description has been updated';
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'updateProject',
        query: print(updateProjectMutation),
        variables: {
          id: projectId,
          data: {
            description: newDesc,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { updateProject },
    } = res.body;
    expect(updateProject.id).toEqual(projectId);
    expect(updateProject.name).toEqual(projectName);
    expect(updateProject.description).toEqual(newDesc);
  });

  it('remove a project', async () => {
    const removeProjectMutation = gql`
      mutation removeProject($id: ID!) {
        removeProject(id: $id) {
          id
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'removeProject',
        query: print(removeProjectMutation),
        variables: {
          id: projectId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { removeProject },
    } = res.body;
    expect(removeProject.id).toEqual(projectId);
  });
});
