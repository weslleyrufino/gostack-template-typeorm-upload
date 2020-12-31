import {getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CSVTransaction{
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const contactsReadStream = fs.createReadStream(filePath);

    const parsers = csvParse({
      from_line: 2,
    });

    const parseCSV = contactsReadStream.pipe(parsers);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];


    parseCSV.on('data', async line =>{
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if(!title || !type || !value) return;// Se esses 3 campos não existirem no documento, não quero que seja inserido aqui.

      categories.push(category);

      transactions.push({title, type, value, category});

    });

    await new Promise(resolve => parseCSV.on('end', resolve))

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existenteCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
    .filter(category => !existenteCategoriesTitles.includes(category))
    .filter((value, index, self) => self.indexOf(value) === index);// Através do index remove os duplicados.

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    // soma das NOVAS as categorias + as categorias existentes.
    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category: finalCategories.find(
            category => category.title === transaction.category,
          ),
        })),
    );

    // category: finalCategories.find(
    //   category => category.title === transaction.category,
    // ),

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;

  }

}

export default ImportTransactionsService;
