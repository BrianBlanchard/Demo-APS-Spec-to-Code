import { Router } from 'express';
import { EmailNotificationController } from '../controllers/email-notification.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { SendEmailRequestSchema } from '../dto/email-notification.dto';

export function createEmailNotificationRoutes(
  controller: EmailNotificationController
): Router {
  const router = Router();

  router.post(
    '/email',
    validateRequest(SendEmailRequestSchema),
    controller.sendEmail
  );

  return router;
}
