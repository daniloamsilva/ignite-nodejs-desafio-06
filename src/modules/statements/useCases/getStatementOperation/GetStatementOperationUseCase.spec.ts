import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetStatementOperationError } from './GetStatementOperationError';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let getStatementOperationUseCase: GetStatementOperationUseCase;
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let user_id: string;

describe('Get Statement Operation', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository,
    );

    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository,
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

  it('should be able to get statement operation', async () => {
    const statement = await createStatementUseCase.execute({
      user_id,
      sender_id: null,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: 'Test statement'
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id,
      statement_id: statement.id as string
    });

    expect(statementOperation).toHaveProperty('id');
  });

  it('should not be able to get statement operation with statement not found', () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: 'statement id'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  it('should not be able to get statement operation with user not found', () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'user not found',
        statement_id: 'statement id'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });
});
