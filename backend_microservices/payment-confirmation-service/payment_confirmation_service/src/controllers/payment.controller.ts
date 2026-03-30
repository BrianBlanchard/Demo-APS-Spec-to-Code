import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { z } from 'zod';
import { ValidationError } from '../middleware/error.middleware';

const confirmationNumberSchema = z.string().min(1).regex(/^PAY-\d{8}-[A-Z0-9]+$/);

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  async getPaymentConfirmation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { confirmationNumber } = req.params;

      const validationResult = confirmationNumberSchema.safeParse(confirmationNumber);
      if (!validationResult.success) {
        throw new ValidationError('Invalid confirmation number format');
      }

      const confirmation = await this.paymentService.getPaymentConfirmation(confirmationNumber);

      res.status(200).json(confirmation);
    } catch (error) {
      next(error);
    }
  }
}
