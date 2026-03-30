import { Request, Response, NextFunction, Router } from 'express';
import { IAccountBalanceService } from '../services/account-balance.service';
import { jwtAuthMiddleware, internalServiceAuthMiddleware } from '../middleware/auth.middleware';
import { validateParams, validateBody } from '../middleware/validation.middleware';
import { AccountIdParamSchema, BalanceUpdateRequestSchema } from '../types/dto';

export class AccountBalanceController {
  public router: Router;

  constructor(private readonly service: IAccountBalanceService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/accounts/:accountId/balance',
      jwtAuthMiddleware,
      validateParams(AccountIdParamSchema),
      this.getBalance.bind(this)
    );

    this.router.post(
      '/accounts/:accountId/balance/update',
      internalServiceAuthMiddleware,
      validateParams(AccountIdParamSchema),
      validateBody(BalanceUpdateRequestSchema),
      this.updateBalance.bind(this)
    );
  }

  private async getBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountId } = req.params;
      const balance = await this.service.getBalance(accountId);
      res.status(200).json(balance);
    } catch (error) {
      next(error);
    }
  }

  private async updateBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accountId } = req.params;
      const response = await this.service.updateBalance(accountId, req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
