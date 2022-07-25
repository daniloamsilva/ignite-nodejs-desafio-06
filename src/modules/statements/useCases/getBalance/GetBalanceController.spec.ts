import request from 'supertest';
import { Connection, createConnection, getConnectionOptions } from 'typeorm';
import { app } from '../../../../app';

let connection: Connection;
let token: string;

describe('Get Balance', () => {
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
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get balance', async () => {
    const response = await request(app).get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it('should not be able to get balance with user not found', async () => {
    const response = await request(app).get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer usernotfound`,
      });

    expect(response.status).toBe(401);
  });
});
