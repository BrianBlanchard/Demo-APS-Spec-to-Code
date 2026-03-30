import { Request, Response, NextFunction } from 'express';
import { ITransactionSearchService } from '../services/transaction-search.service';
import { TransactionSearchRequest } from '../types';

export class TransactionSearchController {
  constructor(private readonly transactionSearchService: ITransactionSearchService) {}

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchRequest: TransactionSearchRequest = req.body;
      const result = await this.transactionSearchService.searchTransactions(searchRequest);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
