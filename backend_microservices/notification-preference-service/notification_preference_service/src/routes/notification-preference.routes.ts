import { Router } from 'express';
import { z } from 'zod';
import { NotificationPreferenceController } from '../controllers/notification-preference.controller';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import { updateNotificationPreferenceSchema } from '../types/notification-preference.dto';

const customerIdSchema = z.object({
  customerId: z.string().min(1),
});

export const createNotificationPreferenceRoutes = (
  controller: NotificationPreferenceController
): Router => {
  const router = Router();

  router.put(
    '/customers/:customerId/notification-preferences',
    validateParams(customerIdSchema),
    validateBody(updateNotificationPreferenceSchema),
    controller.updatePreferences
  );

  return router;
};
