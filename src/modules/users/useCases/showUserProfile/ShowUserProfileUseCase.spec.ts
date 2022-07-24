import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let user_id: string;

describe('Show User Profile', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);

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

  it('should be able to show user profile', async () => {
    const userProfile = await showUserProfileUseCase.execute(user_id);
    expect(userProfile).toHaveProperty('id');
  });

  it('should not be able to show user not found', () => {
    expect(async () => {
      await showUserProfileUseCase.execute('user not found');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
