import { Request, Response, NextFunction } from 'express';
import { IInterestCalculationService } from '../services/interestCalculationService';
import { CalculateInterestResponse } from '../models/dtos';

export class InterestCalculationController {
  constructor(private readonly interestCalculationService: IInterestCalculationService) {}

  calculateInterest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { accountId } = req.params;
      const { calculationDate, applyToAccount } = req.body;

      // Get calculated by from request context (user or service account)
      const calculatedBy = req.userId || 'system';

      const result = await this.interestCalculationService.calculateInterest(
        accountId,
        new Date(calculationDate),
        applyToAccount,
        calculatedBy,
      );

      const response: CalculateInterestResponse = {
        accountId: result.accountId,
        calculationDate: result.calculationDate.toISOString().split('T')[0],
        purchaseBalance: result.purchaseBalance,
        purchaseRate: result.purchaseRate,
        purchaseInterest: result.purchaseInterest,
        purchaseInterestCalculation: result.purchaseInterestCalculation,
        cashAdvanceBalance: result.cashAdvanceBalance,
        cashAdvanceRate: result.cashAdvanceRate,
        cashAdvanceInterest: result.cashAdvanceInterest,
        cashAdvanceInterestCalculation: result.cashAdvanceInterestCalculation,
        totalInterest: result.totalInterest,
        minimumChargeApplied: result.minimumChargeApplied,
        appliedToAccount: result.appliedToAccount,
        calculatedAt: result.calculatedAt.toISOString(),
        calculatedBy: result.calculatedBy,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
