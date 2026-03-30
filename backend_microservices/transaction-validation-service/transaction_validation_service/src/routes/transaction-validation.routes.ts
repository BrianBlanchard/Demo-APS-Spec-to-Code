import { Router } from 'express';
import { TransactionValidationController } from '../controllers/transaction-validation.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { ValidateTransactionRequestSchema } from '../dtos/validate-transaction.dto';

export function createTransactionValidationRoutes(
  controller: TransactionValidationController
): Router {
  const router = Router();

  router.post(
    '/validate',
    validateRequest(ValidateTransactionRequestSchema),
    controller.validateTransaction
  );

  return router;
}
