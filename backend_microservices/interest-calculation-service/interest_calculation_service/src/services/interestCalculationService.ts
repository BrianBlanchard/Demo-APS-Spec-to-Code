import { IAccountRepository } from '../repositories/accountRepository';
import { IInterestCalculationRepository } from '../repositories/interestCalculationRepository';
import { IInterestRateClient } from '../repositories/interestRateClient';
import { IAuditService } from './auditService';
import { BigDecimalCalculator } from '../utils/bigDecimalCalculator';
import {
  NotFoundError,
  UnprocessableEntityError,
  InternalServerError,
} from '../models/errors';
import { AccountStatus, InterestCalculation } from '../models/entities';
import { logger } from '../config/logger';

export interface CalculationResult {
  accountId: string;
  calculationDate: Date;
  purchaseBalance: string;
  purchaseRate: string;
  purchaseInterest: string;
  purchaseInterestCalculation: string;
  cashAdvanceBalance: string;
  cashAdvanceRate: string;
  cashAdvanceInterest: string;
  cashAdvanceInterestCalculation: string;
  totalInterest: string;
  minimumChargeApplied: boolean;
  appliedToAccount: boolean;
  calculatedAt: Date;
  calculatedBy: string;
}

export interface IInterestCalculationService {
  calculateInterest(
    accountId: string,
    calculationDate: Date,
    applyToAccount: boolean,
    calculatedBy: string,
  ): Promise<CalculationResult>;
}

export class InterestCalculationService implements IInterestCalculationService {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly calculationRepository: IInterestCalculationRepository,
    private readonly rateClient: IInterestRateClient,
    private readonly auditService: IAuditService,
  ) {}

  async calculateInterest(
    accountId: string,
    calculationDate: Date,
    applyToAccount: boolean,
    calculatedBy: string,
  ): Promise<CalculationResult> {
    logger.info({ accountId, calculationDate, applyToAccount }, 'Starting interest calculation');

    // Step 1: Retrieve account and validate
    const account = await this.accountRepository.findAccountByAccountId(accountId);
    if (!account) {
      throw new NotFoundError('Account does not exist', { accountId });
    }

    // Validate account status
    if (account.status === AccountStatus.CLOSED) {
      throw new UnprocessableEntityError('Cannot calculate interest for closed account', {
        accountStatus: account.status,
      });
    }

    // Validate disclosure group assignment
    if (!account.disclosureGroupId) {
      throw new UnprocessableEntityError(
        'Account has no disclosure group assignment',
        {
          accountId,
          message: 'Cannot calculate interest without interest rate assignment',
        },
      );
    }

    // Step 2: Retrieve account balances
    const balance = await this.accountRepository.getAccountBalance(account.id);
    if (!balance) {
      throw new InternalServerError('Account balance not found', { accountId });
    }

    // Step 3: Retrieve interest rates from rate service
    const rates = await this.rateClient.getRatesForDisclosureGroup(account.disclosureGroupId);

    const purchaseRate = rates.find((r) => r.rateType === 'PURCHASE');
    const cashAdvanceRate = rates.find((r) => r.rateType === 'CASH_ADVANCE');

    if (!purchaseRate || !cashAdvanceRate) {
      throw new UnprocessableEntityError(
        'Disclosure group missing required interest rates',
        {
          disclosureGroupId: account.disclosureGroupId.toString(),
          availableRates: rates.map((r) => r.rateType),
        },
      );
    }

    // Step 4: Calculate purchase interest
    const purchaseInterestRaw = BigDecimalCalculator.calculateInterest(
      balance.purchaseBalance,
      purchaseRate.rate,
    );
    const purchaseInterestResult = BigDecimalCalculator.applyMinimumCharge(
      purchaseInterestRaw,
      balance.purchaseBalance,
    );

    // Step 5: Calculate cash advance interest
    const cashAdvanceInterestRaw = BigDecimalCalculator.calculateInterest(
      balance.cashAdvanceBalance,
      cashAdvanceRate.rate,
    );
    const cashAdvanceInterestResult = BigDecimalCalculator.applyMinimumCharge(
      cashAdvanceInterestRaw,
      balance.cashAdvanceBalance,
    );

    // Step 6: Calculate total interest
    const totalInterest = BigDecimalCalculator.add(
      purchaseInterestResult.finalInterest,
      cashAdvanceInterestResult.finalInterest,
    );

    const minimumChargeApplied =
      purchaseInterestResult.minimumApplied || cashAdvanceInterestResult.minimumApplied;

    const calculatedAt = new Date();

    // Step 7: Generate formula strings for audit trail
    const purchaseCalculation = BigDecimalCalculator.generateCalculationFormula(
      balance.purchaseBalance,
      purchaseRate.rate,
      purchaseInterestResult.finalInterest,
    );

    const cashAdvanceCalculation = BigDecimalCalculator.generateCalculationFormula(
      balance.cashAdvanceBalance,
      cashAdvanceRate.rate,
      cashAdvanceInterestResult.finalInterest,
    );

    // Step 8: Save calculation record
    const calculation: InterestCalculation = {
      accountId: account.id,
      calculationDate,
      purchaseBalance: balance.purchaseBalance,
      purchaseRate: purchaseRate.rate,
      purchaseInterest: purchaseInterestResult.finalInterest,
      cashAdvanceBalance: balance.cashAdvanceBalance,
      cashAdvanceRate: cashAdvanceRate.rate,
      cashAdvanceInterest: cashAdvanceInterestResult.finalInterest,
      totalInterest,
      minimumChargeApplied,
      appliedToAccount: applyToAccount,
      calculatedAt,
      calculatedBy,
    };

    await this.calculationRepository.saveCalculation(calculation);

    // Step 9: Apply interest to account if requested
    if (applyToAccount) {
      const newBalance = BigDecimalCalculator.add(balance.currentBalance, totalInterest);
      const oldBalance = balance.currentBalance;

      await this.accountRepository.updateAccountBalance(
        account.id,
        newBalance,
        totalInterest,
        calculationDate,
        balance.version,
      );

      // Audit the balance update
      this.auditService.logAudit({
        action: 'UPDATE',
        entityType: 'ACCOUNT_BALANCE',
        entityId: accountId,
        fieldName: 'current_balance',
        oldValue: oldBalance,
        newValue: newBalance,
        additionalContext: {
          interestAmount: totalInterest,
          calculationDate: calculationDate.toISOString(),
        },
      });

      logger.info(
        { accountId, oldBalance, newBalance, totalInterest },
        'Interest applied to account balance',
      );
    }

    return {
      accountId,
      calculationDate,
      purchaseBalance: balance.purchaseBalance,
      purchaseRate: purchaseRate.rate,
      purchaseInterest: purchaseInterestResult.finalInterest,
      purchaseInterestCalculation: purchaseCalculation,
      cashAdvanceBalance: balance.cashAdvanceBalance,
      cashAdvanceRate: cashAdvanceRate.rate,
      cashAdvanceInterest: cashAdvanceInterestResult.finalInterest,
      cashAdvanceInterestCalculation: cashAdvanceCalculation,
      totalInterest,
      minimumChargeApplied,
      appliedToAccount: applyToAccount,
      calculatedAt,
      calculatedBy,
    };
  }
}
