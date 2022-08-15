import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let user_id: string;

describe('Create Statement', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );

    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

    await createUserUseCase.execute({
      name: 'Joe Doe',
      email: 'joedoe@email.com',
      password: 'abc1234',
    });

    const authentication = await authenticateUserUseCase.execute({
      email: 'joedoe@email.com',
      password: 'abc1234',
    });

    user_id = authentication.user.id as string;
  });

  it('should be able to create a new deposit statement', async () => {
    const statement = await createStatementUseCase.execute({
      user_id,
      sender_id: null,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: 'Test deposit'
    });

    expect(statement).toHaveProperty('id');
  });

  it('should be able to create a new withdraw statement', async () => {
    await createStatementUseCase.execute({
      user_id,
      sender_id: null,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: 'Test deposit'
    });

    const statement = await createStatementUseCase.execute({
      user_id,
      sender_id: null,
      type: OperationType.WITHDRAW,
      amount: 150,
      description: 'Test withdraw'
    });

    expect(statement).toHaveProperty('id');
  });

  it('should not be able to create a new statement with insufficient funds', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id,
        sender_id: null,
        type: OperationType.DEPOSIT,
        amount: 200,
        description: 'Test deposit'
      });

      await createStatementUseCase.execute({
        user_id,
        sender_id: null,
        type: OperationType.WITHDRAW,
        amount: 300,
        description: 'Test withdraw'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it('should not be able to create a new statement with user not found', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'user not found',
        sender_id: null,
        type: OperationType.DEPOSIT,
        amount: 200,
        description: 'Test deposit'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
