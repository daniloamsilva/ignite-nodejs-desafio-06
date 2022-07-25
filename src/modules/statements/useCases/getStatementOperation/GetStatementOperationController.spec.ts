import request from 'supertest';
import { Connection, createConnection, getConnectionOptions } from 'typeorm';
import { app } from '../../../../app';
import { Statement } from '../../entities/Statement';
import { v4 as uuid } from 'uuid';

let connection: Connection;
let token: string;
let statement: Statement;

describe('Get Statemante Operation', () => {
  beforeAll(async () => {
    const defaultOptions = await getConnectionOptions();

    connection = await createConnection(
      Object.assign(defaultOptions, {
        host: 'localhost',
        database: 'fin_api',
      })
    );

    await connection.runMigrations();

    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Joe Doe',
        email: 'joedoe@email.com',
        password: 'abc1234',
      });

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'joedoe@email.com',
        password: 'abc1234',
      });

    token = response.body.token;

    const depositResponse = await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 200,
        description: 'Test deposit'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    statement = depositResponse.body;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get statement operation', async () => {
    const response = await request(app).get(`/api/v1/statements/${statement.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it('should not be able to get statement operation with statement not found', async () => {
    const response = await request(app).get(`/api/v1/statements/${uuid()}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it('should not be able to get statement operation with user not found', async () => {
    const response = await request(app).get(`/api/v1/statements/${statement.id}`)
      .set({
        Authorization: `Bearer usernotfound`,
      });

    expect(response.status).toBe(401);
  });
});
