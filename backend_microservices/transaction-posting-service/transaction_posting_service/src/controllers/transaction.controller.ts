import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service';
import { PostTransactionRequest } from '../dto/transaction.dto';

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  async postTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = req.body as PostTransactionRequest;
      const response = await this.transactionService.postTransaction(request);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}
