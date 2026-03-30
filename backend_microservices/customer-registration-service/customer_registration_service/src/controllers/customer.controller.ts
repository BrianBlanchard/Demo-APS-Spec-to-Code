import { Response, NextFunction } from 'express';
import { ICustomerService } from '../services/customer.service';
import { CreateCustomerRequest } from '../types/customer.types';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../config/logger.config';

export class CustomerController {
  constructor(private readonly customerService: ICustomerService) {}

  createCustomer = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      logger.info('Received create customer request');

      const request: CreateCustomerRequest = req.body;
      const userId = req.user?.id || 'SYSTEM';

      const response = await this.customerService.createCustomer(request, userId);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };
}
