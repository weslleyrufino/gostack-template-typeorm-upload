import { EntityRepository, getRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';
import transactionsRouter from '../routes/transactions.routes';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {

  public async getBalance(): Promise<Balance> {
    // consulto a base de dados.
    const transactions = await this.getAll();

    // faço a tratativa do income / outcome;
    const{income, outcome} = transactions.reduce(
      (accumulator: Balance, transaction: Transaction) => {
        switch(transaction.type){
          case 'income':
            accumulator.income += transaction.value;
            break;
          case 'outcome':
            accumulator.outcome += transaction.value;
            break;
          default:
            break;
        }

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0
      },
    );

    const total = income - outcome;

    return {income, outcome, total};
  }

  public async getAll() : Promise<Transaction[]> {
    const repository = await getRepository(Transaction).find({relations: ['category']});

    return repository;
  }
}

export default TransactionsRepository;
