import { Request, Response, NextFunction } from 'express';
import { VerificationService } from '../services/VerificationService';
import { InitiateVerificationRequestDto } from '../types/dtos';

export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  initiateVerification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const request: InitiateVerificationRequestDto = req.body;
      const response = await this.verificationService.initiateVerification(request);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getVerificationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { verificationId } = req.params;
      const response = await this.verificationService.getVerificationStatus(verificationId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
