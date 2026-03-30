import { Request, Response, NextFunction } from 'express';
import { IAccountStatusService } from '../services/account-status.service';
import { StatusUpdateRequest } from '../dtos/status-update-request.dto';
import { getContext } from '../utils/context';

export class AccountStatusController {
  constructor(private readonly accountStatusService: IAccountStatusService) {}

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accountId = req.params.accountId;
      const request: StatusUpdateRequest = req.body;
      const context = getContext();

      if (!context) {
        throw new Error('Request context not found');
      }

      const result = await this.accountStatusService.updateAccountStatus(
        accountId,
        request,
        context.userId,
        context.ipAddress
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
