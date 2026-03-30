import { Router } from 'express';
import { FeeController } from '../controllers/fee.controller';

export function createFeeRoutes(feeController: FeeController): Router {
  const router = Router();

  router.post('/assess', feeController.assessFee);

  return router;
}
