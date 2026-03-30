import { IAccountRepository } from '../repositories/account.repository';
import { ICycleArchiveRepository } from '../repositories/cycle-archive.repository';
import { IAuditService } from './audit.service';
import { CloseCycleRequest, CloseCycleResponse, ProcessingResult } from '../types/billing.types';
import { formatBillingCycle } from '../utils/date.util';
import { BusinessLogicError } from '../utils/errors.util';

export interface IBillingCycleService {
  closeCycle(request: CloseCycleRequest): Promise<CloseCycleResponse>;
}

export class BillingCycleService implements IBillingCycleService {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly cycleArchiveRepository: ICycleArchiveRepository,
    private readonly auditService: IAuditService
  ) {}

  async closeCycle(request: CloseCycleRequest): Promise<CloseCycleResponse> {
    const billingCycle = formatBillingCycle(request.billingCycleEnd);
    const processingDate = new Date(request.processingDate);

    this.auditService.logSuccess({
      operation: 'CYCLE_CLOSE_START',
      metadata: { billingCycle, processingDate: processingDate.toISOString() },
    });

    try {
      const accounts = await this.accountRepository.findActiveAccounts();

      if (accounts.length === 0) {
        throw new BusinessLogicError('No active accounts found for cycle closure', 'NO_ACTIVE_ACCOUNTS');
      }

      const results: ProcessingResult[] = [];

      for (const account of accounts) {
        try {
          const result = await this.processAccount(
            account.id,
            account.currentCycleCredit,
            account.currentCycleDebit,
            billingCycle,
            processingDate
          );
          results.push(result);
        } catch (error) {
          this.auditService.logFailure(
            {
              operation: 'ACCOUNT_PROCESSING',
              metadata: { accountId: account.id, billingCycle },
            },
            error instanceof Error ? error.message : 'Unknown error'
          );
          results.push({
            accountId: account.id,
            interestCharged: 0,
            feesCharged: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const successfulResults = results.filter((r) => r.success);
      const response: CloseCycleResponse = {
        billingCycle,
        accountsProcessed: successfulResults.length,
        totalInterestCharged: successfulResults.reduce((sum, r) => sum + r.interestCharged, 0),
        totalFeesCharged: successfulResults.reduce((sum, r) => sum + r.feesCharged, 0),
        statementsGenerated: successfulResults.length,
      };

      this.auditService.logSuccess({
        operation: 'CYCLE_CLOSE_COMPLETE',
        metadata: {
          billingCycle,
          accountsProcessed: response.accountsProcessed,
          totalInterestCharged: response.totalInterestCharged,
          totalFeesCharged: response.totalFeesCharged,
        },
      });

      return response;
    } catch (error) {
      this.auditService.logFailure(
        {
          operation: 'CYCLE_CLOSE',
          metadata: { billingCycle },
        },
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  private async processAccount(
    accountId: string,
    cycleCredit: number,
    cycleDebit: number,
    billingCycle: string,
    processingDate: Date
  ): Promise<ProcessingResult> {
    const interestCharged = this.calculateInterest(cycleDebit);
    const feesCharged = this.assessFees(cycleCredit, cycleDebit);

    await this.cycleArchiveRepository.create({
      accountId,
      billingCycle,
      cycleCredit,
      cycleDebit,
      interestCharged,
      feesCharged,
      processingDate,
    });

    await this.accountRepository.resetCycleCounters(accountId);

    return {
      accountId,
      interestCharged,
      feesCharged,
      success: true,
    };
  }

  private calculateInterest(debitAmount: number): number {
    const annualInterestRate = 0.18;
    const monthlyInterestRate = annualInterestRate / 12;
    return parseFloat((debitAmount * monthlyInterestRate).toFixed(2));
  }

  private assessFees(creditAmount: number, debitAmount: number): number {
    const balance = debitAmount - creditAmount;
    if (balance < 0) {
      return 0;
    }
    const lateFee = balance > 100 ? 25.0 : 0;
    return lateFee;
  }
}
