import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { PostTransactionRequestSchema } from '../dto/transaction.dto';

export function createTransactionRoutes(controller: TransactionController): Router {
  const router = Router();

  router.post(
    '/transactions',
    authMiddleware,
    validateRequest(PostTransactionRequestSchema),
    (req, res, next) => controller.postTransaction(req, res, next),
  );

  return router;
}
