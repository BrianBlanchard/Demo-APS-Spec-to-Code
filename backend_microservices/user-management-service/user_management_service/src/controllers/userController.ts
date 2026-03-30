import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../services/userService';
import { SuspendUserRequest } from '../models/dtos';

export class UserController {
  constructor(private readonly userService: IUserService) {}

  suspendUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.user_id;
      const request: SuspendUserRequest = req.body;

      const response = await this.userService.suspendUser(userId, request);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
