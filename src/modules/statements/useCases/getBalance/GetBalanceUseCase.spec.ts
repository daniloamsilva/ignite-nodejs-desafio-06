import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { AuthenticateUserUseCase } from '../../../users/useCases/authenticateUser/AuthenticateUserUseCase';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetBalanceError } from './GetBalanceError';
import { GetBalanceUseCase } from './GetBalanceUseCase';

let getBalanceUseCase: GetBalanceUseCase;
let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let user_id: string;

describe('Get Balance', () => {
  beforeEach(async () => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository,
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
  })

  it('should be able to get balance', async () => {
    const balance = await getBalanceUseCase.execute({user_id});
    expect(balance).toHaveProperty('balance');
  });

  it('should not be able to get balance with user not found', () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'user not found'
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
