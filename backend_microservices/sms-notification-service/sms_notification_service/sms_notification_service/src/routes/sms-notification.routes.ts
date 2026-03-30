import { Router } from 'express';
import { SmsNotificationController } from '../controllers/sms-notification.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { SendSmsRequestSchema } from '../dtos/sms.dto';

export function createSmsNotificationRouter(controller: SmsNotificationController): Router {
  const router = Router();

  router.post(
    '/api/v1/notifications/sms',
    validateRequest(SendSmsRequestSchema),
    controller.sendSms
  );

  return router;
}
