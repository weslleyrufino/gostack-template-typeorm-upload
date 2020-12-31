// import AppError from '../errors/AppError';

import { getRepository } from "typeorm";
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    try {
      const transaction = getRepository(Transaction);

      transaction.delete(id);
    } catch (error) {

    }

  }
}

export default DeleteTransactionService;
