import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUsecase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe('Authenticate Use', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();

    authenticateUserUsecase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it('should be able to authenticate user', async () => {
    await createUserUseCase.execute({
      name: 'Joe Doe',
      email: 'joedoe@email.com',
      password: 'abc1234',
    });

    const authentication = await authenticateUserUsecase.execute({
      email: 'joedoe@email.com',
      password: 'abc1234'
    });

    expect(authentication).toHaveProperty('token');
  });

  it('should not be able to authenticate user with email not found', () => {
    expect(async () => {
      await authenticateUserUsecase.execute({
        email: 'notfound@emai.com',
        password: 'abc1234',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate user with wrong password', () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'Joe Doe',
        email: 'joedoe@email.com',
        password: 'abc1234',
      });

      await authenticateUserUsecase.execute({
        email: 'joedoe@email.com',
        password: 'wrong password',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
