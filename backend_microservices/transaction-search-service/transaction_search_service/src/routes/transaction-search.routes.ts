import { Router } from 'express';
import { TransactionSearchController } from '../controllers/transaction-search.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { TransactionSearchRequestSchema } from '../types/validation.schemas';

export function createTransactionSearchRoutes(
  controller: TransactionSearchController
): Router {
  const router = Router();

  router.post(
    '/search',
    validateRequest(TransactionSearchRequestSchema),
    controller.search.bind(controller)
  );

  return router;
}
