import { getRepository, Repository } from "typeorm";
import { ICreateStatementDTO } from "../dtos/ICreateStatementDTO";
import { IGetBalanceDTO } from "../dtos/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../dtos/IGetStatementOperationDTO";

import { Statement } from "../entities/Statement";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    sender_id,
    amount,
    description,
    type
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      sender_id,
      amount,
      description,
      type
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id }
    });
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    >
  {
    const statement = await this.repository.find({
      where: [{ user_id }, { sender_id: user_id }],
    });

    const balance = statement.reduce((acc, operation) => {
      switch (operation.type) {
        case 'deposit':
          return acc + operation.amount;
        case 'withdraw':
          return acc - operation.amount;
        case 'transfer':
          if (operation.sender_id === user_id) {
            return acc - operation.amount
          } else {
            return acc + operation.amount
          }
        default:
          return 0;
      }
    }, 0)

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }
}
