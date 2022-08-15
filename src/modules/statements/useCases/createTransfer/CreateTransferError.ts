import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferError {
  export class SenderAndRecipientSameUser extends AppError {
    constructor() {
      super('Sender e Recipient is the same user', 404);
    }

  }

  export class SenderNotFound extends AppError {
    constructor() {
      super('Sender not found', 404);
    }

  }

  export class RecipientNotFound extends AppError {
    constructor() {
      super('Recipient not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super('Insufficient funds', 404);
    }
  }
}
