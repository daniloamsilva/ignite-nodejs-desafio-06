import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserError } from './CreateUserError';
import { CreateUserUseCase } from './CreateUserUseCase';

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe('Create Users', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it('should be create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Joe Doe',
      email: 'joedoe@email.com',
      password: 'abc1234',
    });

    expect(user).toHaveProperty('id');
  });

  it('should not be create an existent user', () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'Joe Doe',
        email: 'joedoe@email.com',
        password: 'abc1234',
      });

      await createUserUseCase.execute({
        name: 'Joe Doe',
        email: 'joedoe@email.com',
        password: 'abc1234',
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
