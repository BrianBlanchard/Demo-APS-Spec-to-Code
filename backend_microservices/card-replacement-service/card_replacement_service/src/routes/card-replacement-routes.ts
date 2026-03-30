import { Router } from 'express';
import { CardReplacementController } from '../controllers/card-replacement-controller';
import { validateBody, validateParams } from '../middleware/validation-middleware';
import {
  cardReplacementRequestSchema,
  cardNumberParamSchema,
} from '../middleware/validators';

export function createCardReplacementRoutes(
  controller: CardReplacementController,
): Router {
  const router = Router();

  router.post(
    '/cards/:cardNumber/replace',
    validateParams(cardNumberParamSchema),
    validateBody(cardReplacementRequestSchema),
    controller.replaceCard,
  );

  return router;
}
