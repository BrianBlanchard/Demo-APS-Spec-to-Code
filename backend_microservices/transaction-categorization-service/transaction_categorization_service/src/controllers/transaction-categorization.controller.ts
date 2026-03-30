import { Request, Response, NextFunction } from 'express';
import type { ITransactionCategorizationService } from '../services/transaction-categorization.service';
import type { CategorizeRequest } from '../dto/categorize-request.dto';

export class TransactionCategorizationController {
  constructor(private readonly categorizationService: ITransactionCategorizationService) {}

  async categorizeTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request: CategorizeRequest = req.body;

      const response = await this.categorizationService.categorizeTransaction(request);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
