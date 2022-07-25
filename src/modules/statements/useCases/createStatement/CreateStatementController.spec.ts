import request from 'supertest';
import { Connection, createConnection, getConnectionOptions } from 'typeorm';
import { app } from '../../../../app';

let connection: Connection;
let token: string;

describe('Create Statement', () => {
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

  it('should be able to create a new deposit statement', async () => {
    const response = await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 200,
        description: 'Test deposit'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it('should be able to create a new withdraw statement', async () => {
    await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 200,
        description: 'Test deposit'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 150,
        description: 'Test withdraw'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it('should not be able to create a new statement with insufficient funds', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 1000,
        description: 'Test withdraw'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a new statement with user not found', async () => {
    const response = await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 200,
        description: 'Test deposit'
      })
      .set({
        Authorization: `Bearer usernotfound`,
      });

    expect(response.status).toBe(401);
  });
});
