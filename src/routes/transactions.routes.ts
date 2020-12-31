import { Router } from 'express';
import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const getTransaction = new TransactionsRepository();
  const transactions = await getTransaction.getAll();
  const balance = await getTransaction.getBalance();

  return response.json({
    transactions,
    balance
  });
});

transactionsRouter.post('/', async (request, response) => {
  const {title, value, type, category} = request.body;

  const createTransaction = new CreateTransactionService();

  const verifyValidBalance = await createTransaction.verifyValidBalance(value, type);

  if(verifyValidBalance){
    const transaction = await createTransaction.execute({ title, value, type, category });
    return response.json(transaction);
  }
  else{
    return response.status(400).json({"message": "Invalid Outcome", "status": "error"})
  }


});

transactionsRouter.delete('/:id', async (request, response) => {
  const deleteTransaction = new DeleteTransactionService();

  const id = request.params.id;

  await deleteTransaction.execute(id);

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();
    const transactions = await importTransactions.execute(request.file.path);

    return response.json(transactions);
});

export default transactionsRouter;
