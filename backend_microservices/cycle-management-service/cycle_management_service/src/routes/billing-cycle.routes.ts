import { Router } from 'express';
import { BillingCycleController } from '../controllers/billing-cycle.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { CloseCycleRequestSchema } from '../types/validation.schemas';

export const createBillingCycleRouter = (controller: BillingCycleController): Router => {
  const router = Router();

  router.post('/close', validateRequest(CloseCycleRequestSchema), controller.closeCycle);

  return router;
};
