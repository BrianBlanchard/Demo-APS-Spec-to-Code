import { Router } from 'express';
import { VerificationController } from '../controllers/VerificationController';
import { validateRequest } from '../middleware/validation';
import { initiateVerificationRequestSchema } from '../validation/schemas';

export const createVerificationRoutes = (controller: VerificationController): Router => {
  const router = Router();

  router.post(
    '/identity',
    validateRequest(initiateVerificationRequestSchema),
    controller.initiateVerification
  );

  router.get('/identity/:verificationId', controller.getVerificationStatus);

  return router;
};
