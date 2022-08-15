import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { ICreateTransferDTO } from "../../dtos/ICreateTransferDTO";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ sender_id, recipient_id, amount, description }: ICreateTransferDTO): Promise<Statement> {
    if(sender_id === recipient_id) {
      throw new CreateTransferError.SenderAndRecipientSameUser();
    }

    const sender = await this.usersRepository.findById(sender_id);

    if(!sender) {
      throw new CreateTransferError.SenderNotFound();
    }

    const recipient = await this.usersRepository.findById(recipient_id);

    if(!recipient) {
      throw new CreateTransferError.RecipientNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

    if (balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const tranferOperation = await this.statementsRepository.create({
      user_id: recipient_id,
      sender_id,
      type: OperationType.TRANSFER,
      amount,
      description
    });

    return tranferOperation;
  }
}

export { CreateTransferUseCase };
