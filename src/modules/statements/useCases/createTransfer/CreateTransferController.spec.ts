import request from 'supertest';
import { Connection, createConnection, getConnectionOptions } from "typeorm";
import { app } from '../../../../app';

let connection: Connection;
let token: string;
let sender_id: string;
let recipient_id: string;

describe('Create Transfer', () => {
  beforeAll(async () => {
    const defaultOptions = await getConnectionOptions();

    connection = await createConnection(
      Object.assign(defaultOptions, {
        host: 'localhost',
        database: 'postgres',
      })
    );

    await connection.runMigrations();

    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Sender',
        email: 'sender@email.com',
        password: 'abc1234',
      });

    await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Recipient',
        email: 'recipient@email.com',
        password: 'abc1234',
      });

    const senderSignIn = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'sender@email.com',
        password: 'abc1234',
      });

    const recipientSignIn = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'recipient@email.com',
        password: 'abc1234',
      });

    token = senderSignIn.body.token;
    sender_id = senderSignIn.body.user.id;
    recipient_id = recipientSignIn.body.user.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new transfer', async () => {
    await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 200,
        description: 'Test deposit'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app).post(`/api/v1/statements/transfer/${recipient_id}`)
      .send({
        amount: 200,
        description: 'Test transfer'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it('should not be able to create a new transfer with insufficient funds', async () => {
    const response = await request(app).post(`/api/v1/statements/transfer/${recipient_id}`)
      .send({
        amount: 200,
        description: 'Test transfer'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it('should not be able to create a new transfer with same sender e recipient user', async () => {
    const response = await request(app).post(`/api/v1/statements/transfer/${sender_id}`)
      .send({
        amount: 200,
        description: 'Test transfer'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it('should not be able to create a new transfer with sender user not found', async () => {
    const response = await request(app).post(`/api/v1/statements/transfer/${recipient_id}`)
      .send({
        amount: 1000,
        description: 'Test transfer'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it('should not be able to create a new transfer with recipient user not found', async () => {
    const response = await request(app).post('/api/v1/statements/transfer/recipient_not_found')
      .send({
        amount: 200,
        description: 'Test transfer'
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
