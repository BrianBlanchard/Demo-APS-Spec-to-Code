import { Request, Response, NextFunction } from 'express';
import { SendEmailRequest, SendEmailResponse } from '../dto/email-notification.dto';
import { IEmailNotificationService } from '../services/email-notification.service';

export class EmailNotificationController {
  constructor(private readonly emailNotificationService: IEmailNotificationService) {}

  sendEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const request: SendEmailRequest = req.body;

      const result = await this.emailNotificationService.sendEmail(request);

      const response: SendEmailResponse = {
        notificationId: result.notificationId,
        status: result.status,
        sentAt: result.sentAt,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
