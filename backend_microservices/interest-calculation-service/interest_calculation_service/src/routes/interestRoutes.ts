import { Router } from 'express';
import { InterestCalculationController } from '../controllers/interestCalculationController';
import { validateRequest } from '../middleware/validation';
import { CalculateInterestRequestSchema } from '../models/dtos';

export const createInterestRoutes = (
  controller: InterestCalculationController,
): Router => {
  const router = Router();

  router.post(
    '/accounts/:accountId/interest/calculate',
    validateRequest(CalculateInterestRequestSchema),
    controller.calculateInterest,
  );

  return router;
};
