import request from 'supertest';
import { Connection, createConnection, getConnectionOptions } from 'typeorm';
import { app } from '../../../../app';

let connection: Connection;

describe('Authenticate User', () => {
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
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate user', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'joedoe@email.com',
        password: 'abc1234',
      });

    expect(response.status).toBe(200);
  });

  it('should not be able to authenticate user with email not found', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'notfound@email.com',
        password: 'abc1234',
      });

    expect(response.status).toBe(401);
  });

  it('should not be able to authenticate user with wrong password', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'joedoe@email.com',
        password: 'wrong password',
      });

    expect(response.status).toBe(401);
  });
});
