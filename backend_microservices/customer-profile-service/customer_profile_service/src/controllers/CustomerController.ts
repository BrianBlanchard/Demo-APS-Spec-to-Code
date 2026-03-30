import { Request, Response, NextFunction } from 'express';
import { ICustomerService } from '../services/CustomerService';
import { UpdateCustomerRequestDTO, UserContext } from '../types/dtos';

export class CustomerController {
  constructor(private readonly customerService: ICustomerService) {}

  getCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { customerId } = req.params;
      const { includeAccounts } = req.query as { includeAccounts?: boolean };

      const userContext: UserContext = {
        userId: req.user!.userId,
        role: req.user!.role,
        customerId: req.user!.customerId,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        traceId: res.getHeader('X-Trace-Id') as string,
      };

      const customer = await this.customerService.getCustomerById(
        customerId,
        userContext,
        includeAccounts
      );

      res.status(200).json(customer);
    } catch (error) {
      next(error);
    }
  };

  updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { customerId } = req.params;
      const updates: UpdateCustomerRequestDTO = req.body;

      const userContext: UserContext = {
        userId: req.user!.userId,
        role: req.user!.role,
        customerId: req.user!.customerId,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        traceId: res.getHeader('X-Trace-Id') as string,
      };

      const result = await this.customerService.updateCustomer(customerId, updates, userContext);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
