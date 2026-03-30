import { Router } from 'express';
import { CardController } from '../controllers/card.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { z } from 'zod';

const cardNumberSchema = z.object({
  cardNumber: z.string().min(4).max(16),
});

const querySchema = z.object({
  includeAccount: z.enum(['true', 'false']).optional(),
  includeCustomer: z.enum(['true', 'false']).optional(),
  includeTransactions: z.enum(['true', 'false']).optional(),
});

export function createCardRoutes(cardController: CardController): Router {
  const router = Router();

  router.get(
    '/cards/:cardNumber',
    authMiddleware,
    validateRequest({ params: cardNumberSchema, query: querySchema }),
    (req, res, next) => cardController.getCard(req, res, next)
  );

  return router;
}
