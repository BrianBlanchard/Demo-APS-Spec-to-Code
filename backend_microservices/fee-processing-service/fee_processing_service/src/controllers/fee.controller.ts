import { Request, Response, NextFunction } from 'express';
import { FeeAssessmentRequestSchema } from '../dtos/fee-assessment-request.dto';
import { IFeeService } from '../services/fee.service';

export class FeeController {
  constructor(private feeService: IFeeService) {}

  assessFee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedRequest = FeeAssessmentRequestSchema.parse(req.body);
      const result = await this.feeService.assessFee(validatedRequest);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
