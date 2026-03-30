import { Knex } from 'knex';
import { InterestCalculation } from '../models/entities';

export interface IInterestCalculationRepository {
  saveCalculation(calculation: InterestCalculation): Promise<void>;
}

export class InterestCalculationRepository implements IInterestCalculationRepository {
  constructor(private readonly db: Knex) {}

  async saveCalculation(calculation: InterestCalculation): Promise<void> {
    await this.db('interest_calculations').insert({
      account_id: calculation.accountId.toString(),
      calculation_date: calculation.calculationDate,
      purchase_balance: calculation.purchaseBalance,
      purchase_rate: calculation.purchaseRate,
      purchase_interest: calculation.purchaseInterest,
      cash_advance_balance: calculation.cashAdvanceBalance,
      cash_advance_rate: calculation.cashAdvanceRate,
      cash_advance_interest: calculation.cashAdvanceInterest,
      total_interest: calculation.totalInterest,
      minimum_charge_applied: calculation.minimumChargeApplied,
      applied_to_account: calculation.appliedToAccount,
      calculated_at: calculation.calculatedAt,
      calculated_by: calculation.calculatedBy,
    });
  }
}
