import { Request, Response, NextFunction } from 'express';
import { ITransactionValidationService } from '../services/transaction-validation.service';
import { ValidateTransactionRequest } from '../dtos/validate-transaction.dto';

export class TransactionValidationController {
  constructor(private readonly validationService: ITransactionValidationService) {}

  validateTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const request = req.body as ValidateTransactionRequest;
      const response = await this.validationService.validateTransaction(request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
