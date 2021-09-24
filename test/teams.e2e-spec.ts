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
  const password = '12345678';
  const name = faker.name.findName();

  let userId: string;
  let teamId: string;
  const teamName = faker.name.title();
  const teamDesc = 'This is my Awesome team, not so awesome though';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('signup a user', async () => {
    // The user should be Admin to run the following tests successful
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, name, isAdmin: true })
      .expect(201);
    access_token = res.body.access_token;
    expect(access_token).toBeDefined();
  });

  it('create a team', async () => {
    const createTeamMutation = gql`
      mutation createTeam($data: NewTeamInput!) {
        createTeam(data: $data) {
          id
          name
          description
          owner {
            id
            email
          }
          members {
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
        operationName: 'createTeam',
        query: print(createTeamMutation),
        variables: {
          data: {
            name: teamName,
            description: teamDesc,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { createTeam },
    } = res.body;
    expect(createTeam).toBeDefined();
    expect(createTeam.id).toBeDefined();
    expect(createTeam.name).toEqual(teamName);
    expect(createTeam.description).toEqual(teamDesc);

    userId = createTeam.owner.id; // IMPORTANT
    teamId = createTeam.id; // IMPORTANT
  });

  it('list all teams', async () => {
    const listTeamsQuery = gql`
      query getAllTeams($ownerId: ID) {
        teams(ownerId: $ownerId) {
          result {
            id
            name
            description
            owner {
              email
            }
            members {
              email
            }
          }
          total
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'getAllTeams',
        query: print(listTeamsQuery),
        variables: {
          ownerId: userId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { teams },
    } = res.body;
    expect(teams).toBeDefined();
    expect(teams.total).toBeDefined();
    expect(teams.result).toHaveLength(1);
    expect(teams.total).toEqual(1);
    expect(teams.result[0].id).toEqual(teamId);
    expect(teams.result[0].name).toEqual(teamName);
    expect(teams.result[0].description).toEqual(teamDesc);
    expect(teams.result[0].owner.email).toEqual(email);
    expect(teams.result[0].members[0].email).toEqual(email);
  });

  it('get a team by id', async () => {
    const getTeamQuery = gql`
      query getTeam($id: ID!) {
        team(id: $id) {
          id
          name
          description
          owner {
            email
          }
          members {
            email
          }
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'getTeam',
        query: print(getTeamQuery),
        variables: {
          id: teamId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { team },
    } = res.body;
    expect(team.id).toEqual(teamId);
    expect(team.name).toEqual(teamName);
    expect(team.description).toEqual(teamDesc);
    expect(team.owner.email).toEqual(email);
    expect(team.members[0].email).toEqual(email);
  });

  it('update a team owned by me', async () => {
    const updateTeamMutation = gql`
      mutation updateTeam($id: ID!, $data: UpdateTeamInput!) {
        updateTeam(id: $id, data: $data) {
          id
          name
          description
          owner {
            email
          }
          members {
            email
          }
        }
      }
    `;
    const newTeamDesc = teamDesc + ' (UPDATED)';
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'updateTeam',
        query: print(updateTeamMutation),
        variables: {
          id: teamId,
          data: {
            description: newTeamDesc,
          },
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { updateTeam },
    } = res.body;
    expect(updateTeam).toBeDefined();
    expect(updateTeam.id).toEqual(teamId);
    expect(updateTeam.name).toEqual(teamName);
    expect(updateTeam.description).toEqual(newTeamDesc);
    expect(updateTeam.owner.email).toEqual(email);
    expect(updateTeam.members[0].email).toEqual(email);
  });

  it('add a new team member', async () => {
    const addTeamMemberMutation = gql`
      mutation addTeamMember($userId: ID!, $teamId: ID!) {
        addTeamMember(userId: $userId, teamId: $teamId) {
          id
          name
          description
          owner {
            id
            email
          }
          members {
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
        operationName: 'addTeamMember',
        query: print(addTeamMemberMutation),
        variables: {
          userId: userId, // actualy, this user is already a member... :)
          teamId: teamId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { addTeamMember },
    } = res.body;
    expect(addTeamMember).toBeDefined();
    expect(addTeamMember.id).toEqual(teamId);
    expect(addTeamMember.name).toEqual(teamName);
    expect(addTeamMember.members).toHaveLength(1);
    expect(addTeamMember.members[0].id).toEqual(userId);
  });

  it('remove a team member', async () => {
    const removeTeamMemberMutation = gql`
      mutation removeTeamMember($userId: ID!, $teamId: ID!) {
        removeTeamMember(userId: $userId, teamId: $teamId) {
          id
          name
          description
          owner {
            id
            email
          }
          members {
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
        operationName: 'removeTeamMember',
        query: print(removeTeamMemberMutation),
        variables: {
          userId: userId, // actualy, this user is already a member... :)
          teamId: teamId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { removeTeamMember },
    } = res.body;
    expect(removeTeamMember).toBeDefined();
    expect(removeTeamMember.id).toEqual(teamId);
    expect(removeTeamMember.name).toEqual(teamName);
    expect(removeTeamMember.members).toHaveLength(0);
  });

  it('remove a team owned by me', async () => {
    const removeTeamMutation = gql`
      mutation removeTeam($id: ID!) {
        removeTeam(id: $id) {
          id
          name
        }
      }
    `;
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${access_token}`)
      .send({
        operationName: 'removeTeam',
        query: print(removeTeamMutation),
        variables: {
          id: teamId,
        },
      });
    expect(res.body.data).toBeDefined();
    const {
      data: { removeTeam },
    } = res.body;
    expect(removeTeam).toBeDefined();
    expect(removeTeam.id).toEqual(teamId);
    expect(removeTeam.name).toEqual(teamName);
  });
});
