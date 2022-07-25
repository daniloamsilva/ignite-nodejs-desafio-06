import request from 'supertest';
import { Connection, createConnection, getConnectionOptions } from 'typeorm';
import { app } from '../../../../app';

let connection: Connection;

describe('Create User', () => {
  beforeAll(async () => {
    const defaultOptions = await getConnectionOptions();

    connection = await createConnection(
      Object.assign(defaultOptions, {
        host: 'localhost',
        database: 'fin_api',
      })
    );

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be create a new user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Joe Doe',
        email: 'joedoe@email.com',
        password: 'abc1234',
      });

    expect(response.status).toBe(201);
  });

  it('should not be create an existent user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Joe Doe',
        email: 'joedoe@email.com',
        password: 'abc1234',
      });

    expect(response.status).toBe(400);
  });
});
