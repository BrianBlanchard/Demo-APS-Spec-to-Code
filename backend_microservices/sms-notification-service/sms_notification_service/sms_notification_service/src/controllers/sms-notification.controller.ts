import { Request, Response, NextFunction } from 'express';
import { ISmsNotificationService } from '../services/sms-notification.service';
import { SendSmsRequest } from '../dtos/sms.dto';

export class SmsNotificationController {
  constructor(private readonly smsNotificationService: ISmsNotificationService) {}

  sendSms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const request: SendSmsRequest = req.body;
      const response = await this.smsNotificationService.sendSms(request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
