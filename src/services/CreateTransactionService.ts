// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import { getRepository } from 'typeorm';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface CategoryTitle{
  category: string;
}

class CreateTransactionService {
  public async execute({title, value, type, category}: Request): Promise<Transaction> {

    const categoryRepository = getRepository(Category);

  // Verificar pelo title da tabela category se a mesma existe.
    const categoryRep = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

  // Se existir, pegar o id dela para usar no insert da transaction.
  // Se não, criar category. Pegar o id gerado para usar no insert da transaction.
    const category_id = categoryRep == null || categoryRep == undefined ? await this.createCategory({category}) : categoryRep.id;

  // Inserir transaction no banco.
    const transactionRepository = getRepository(Transaction);

    const transaction = transactionRepository.create({
      title: title,
      value: value,
      type: type,
      category_id: category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }

  public async verifyValidBalance(value: number, type: string): Promise<boolean>{
    const getTransaction = new TransactionsRepository();
    if(type == 'outcome'){
      const balance = getTransaction.getBalance();
      const total = (await balance).total;
      if(value > total)
        return false
      else
        return true
    }else
      return true;
  }

  private async createCategory({category}: CategoryTitle): Promise<string>{
    const categoryRepository = getRepository(Category);

    const categoryData = categoryRepository.create({
      title: category,
    })

    await categoryRepository.save(categoryData);

    return categoryData.id;
  }
}

export default CreateTransactionService;
