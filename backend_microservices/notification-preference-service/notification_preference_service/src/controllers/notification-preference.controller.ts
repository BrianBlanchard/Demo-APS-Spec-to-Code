import { Request, Response, NextFunction } from 'express';
import { INotificationPreferenceService } from '../services/notification-preference.service';
import { UpdateNotificationPreferenceDto } from '../types/notification-preference.dto';

export class NotificationPreferenceController {
  constructor(private readonly service: INotificationPreferenceService) {}

  updatePreferences = async (
    req: Request<{ customerId: string }, unknown, UpdateNotificationPreferenceDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { customerId } = req.params;
      const preferences = req.body;

      const result = await this.service.updatePreferences(customerId, preferences);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
