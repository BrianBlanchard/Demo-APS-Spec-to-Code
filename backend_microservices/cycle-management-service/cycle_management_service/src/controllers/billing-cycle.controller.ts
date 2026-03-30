import { Request, Response, NextFunction } from 'express';
import { IBillingCycleService } from '../services/billing-cycle.service';
import { CloseCycleRequest } from '../types/billing.types';

export class BillingCycleController {
  constructor(private readonly billingCycleService: IBillingCycleService) {}

  closeCycle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const request: CloseCycleRequest = req.body;
      const response = await this.billingCycleService.closeCycle(request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
