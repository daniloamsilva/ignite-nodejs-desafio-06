import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createTransferUseCase: CreateTransferUseCase;

let sender_id: string;
let recipient_id: string;

describe('Create Transfer', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);

    createTransferUseCase = new CreateTransferUseCase(usersRepository, statementsRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);

    const sender = await createUserUseCase.execute({
      name: 'Sender',
      email: 'sender@email.com',
      password: 'sender1234',
    });

    const recipient = await createUserUseCase.execute({
      name: 'Recipient',
      email: 'recipient@email.com',
      password: 'recipient1234',
    });

    sender_id = sender.id as string;
    recipient_id = recipient.id as string;
  });

  it('should be able to create a new transfer', async () => {
    await createStatementUseCase.execute({
      user_id: sender_id,
      sender_id: null,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: 'Test deposit'
    });

    const transfer = await createTransferUseCase.execute({
      sender_id,
      recipient_id,
      amount: 100,
      description: 'Transfer test'
    });

    expect(transfer).toHaveProperty('id');
  });

  it('should not be able to create a new transfer with insufficient funds', async () => {
    expect(async () => {
      await createTransferUseCase.execute({
        sender_id,
        recipient_id,
        amount: 1000,
        description: 'Transfer test'
      });
    }).rejects.toBeInstanceOf(CreateTransferError.InsufficientFunds);
  });

  it('should not be able to create a new transfer with same sender e recipient user', async () => {
    expect(async () => {
      await createTransferUseCase.execute({
        sender_id,
        recipient_id: sender_id,
        amount: 100,
        description: 'Transfer test'
      });
    }).rejects.toBeInstanceOf(CreateTransferError.SenderAndRecipientSameUser);
  });

  it('should not be able to create a new transfer with sender user not found', () => {
    expect(async () => {
      await createTransferUseCase.execute({
        sender_id: 'sender not found',
        recipient_id,
        amount: 100,
        description: 'Transfer test'
      });
    }).rejects.toBeInstanceOf(CreateTransferError.SenderNotFound);
  });

  it('should not be able to create a new transfer with recipient user not found', async () => {
    expect(async () => {
      await createTransferUseCase.execute({
        sender_id,
        recipient_id: 'recipient not found',
        amount: 100,
        description: 'Transfer test'
      });
    }).rejects.toBeInstanceOf(CreateTransferError.RecipientNotFound);
  });
});
