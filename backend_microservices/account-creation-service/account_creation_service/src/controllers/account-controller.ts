import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/account-service';
import { CreateAccountRequest } from '../types/dtos';
import config from '../config/config';

export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  async createAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request: CreateAccountRequest = req.body;
      const account = await this.accountService.createAccount(request);

      // Set Location header
      const location = `${config.server.apiBasePath}/${config.server.apiVersion}/${config.server.capabilityName}/${account.accountId}`;

      res.status(201).location(location).json(account);
    } catch (error) {
      next(error);
    }
  }
}
