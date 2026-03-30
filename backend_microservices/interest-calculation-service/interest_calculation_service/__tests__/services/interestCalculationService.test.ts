import { InterestCalculationService } from '../../src/services/interestCalculationService';
import { IAccountRepository } from '../../src/repositories/accountRepository';
import { IInterestCalculationRepository } from '../../src/repositories/interestCalculationRepository';
import { IInterestRateClient } from '../../src/repositories/interestRateClient';
import { IAuditService, AuditEntry } from '../../src/services/auditService';
import {
  Account,
  AccountBalance,
  AccountStatus,
  InterestCalculation,
  InterestRate,
} from '../../src/models/entities';
import {
  NotFoundError,
  UnprocessableEntityError,
  InternalServerError,
  ServiceUnavailableError,
} from '../../src/models/errors';

// Test doubles
class FakeAccountRepository implements IAccountRepository {
  private accounts = new Map<string, Account>();
  private balances = new Map<string, AccountBalance>();

  addAccount(account: Account): void {
    this.accounts.set(account.accountId, account);
  }

  addBalance(accountId: bigint, balance: AccountBalance): void {
    this.balances.set(accountId.toString(), balance);
  }

  async findAccountByAccountId(accountId: string): Promise<Account | null> {
    return this.accounts.get(accountId) || null;
  }

  async getAccountBalance(accountId: bigint): Promise<AccountBalance | null> {
    return this.balances.get(accountId.toString()) || null;
  }

  async updateAccountBalance(
    accountId: bigint,
    newBalance: string,
    interestAmount: string,
    interestDate: Date,
    currentVersion: bigint,
  ): Promise<void> {
    const balance = this.balances.get(accountId.toString());
    if (!balance || balance.version !== currentVersion) {
      throw new Error('Optimistic lock failure: Account balance was modified by another transaction');
    }
    balance.currentBalance = newBalance;
    balance.lastInterestAmount = interestAmount;
    balance.lastInterestDate = interestDate;
    balance.version = currentVersion + BigInt(1);
  }

  getBalance(accountId: bigint): AccountBalance | null {
    return this.balances.get(accountId.toString()) || null;
  }
}

class FakeInterestCalculationRepository implements IInterestCalculationRepository {
  private calculations: InterestCalculation[] = [];

  async saveCalculation(calculation: InterestCalculation): Promise<void> {
    this.calculations.push({ ...calculation });
  }

  getCalculations(): InterestCalculation[] {
    return this.calculations;
  }

  getLastCalculation(): InterestCalculation | null {
    return this.calculations.length > 0 ? this.calculations[this.calculations.length - 1] : null;
  }
}

class FakeInterestRateClient implements IInterestRateClient {
  private rates = new Map<string, InterestRate[]>();
  private shouldFail = false;

  setRates(disclosureGroupId: bigint, rates: InterestRate[]): void {
    this.rates.set(disclosureGroupId.toString(), rates);
  }

  setShouldFail(fail: boolean): void {
    this.shouldFail = fail;
  }

  async getRatesForDisclosureGroup(disclosureGroupId: bigint): Promise<InterestRate[]> {
    if (this.shouldFail) {
      throw new ServiceUnavailableError('Interest rate service is unavailable');
    }
    return this.rates.get(disclosureGroupId.toString()) || [];
  }
}

class FakeAuditService implements IAuditService {
  private entries: AuditEntry[] = [];

  logAudit(entry: AuditEntry): void {
    this.entries.push({ ...entry });
  }

  getEntries(): AuditEntry[] {
    return this.entries;
  }

  getLastEntry(): AuditEntry | null {
    return this.entries.length > 0 ? this.entries[this.entries.length - 1] : null;
  }
}

describe('InterestCalculationService', () => {
  let service: InterestCalculationService;
  let accountRepo: FakeAccountRepository;
  let calculationRepo: FakeInterestCalculationRepository;
  let rateClient: FakeInterestRateClient;
  let auditService: FakeAuditService;

  beforeEach(() => {
    accountRepo = new FakeAccountRepository();
    calculationRepo = new FakeInterestCalculationRepository();
    rateClient = new FakeInterestRateClient();
    auditService = new FakeAuditService();
    service = new InterestCalculationService(
      accountRepo,
      calculationRepo,
      rateClient,
      auditService,
    );
  });

  describe('calculateInterest', () => {
    describe('successful calculations', () => {
      it('should calculate interest for active account with balances', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '3000.00',
          purchaseBalance: '2500.00',
          cashAdvanceBalance: '500.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        const result = await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          false,
          'user123',
        );

        expect(result.accountId).toBe('ACC12345678');
        expect(result.purchaseBalance).toBe('2500.00');
        expect(result.purchaseRate).toBe('18.990');
        expect(result.purchaseInterest).toBe('39.56');
        expect(result.cashAdvanceBalance).toBe('500.00');
        expect(result.cashAdvanceRate).toBe('24.990');
        expect(result.cashAdvanceInterest).toBe('10.41');
        expect(result.totalInterest).toBe('49.97');
        expect(result.minimumChargeApplied).toBe(false);
        expect(result.appliedToAccount).toBe(false);
        expect(result.calculatedBy).toBe('user123');
      });

      it('should save calculation to repository', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '3000.00',
          purchaseBalance: '2500.00',
          cashAdvanceBalance: '500.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          false,
          'user123',
        );

        const calculations = calculationRepo.getCalculations();
        expect(calculations.length).toBe(1);
        expect(calculations[0].accountId).toBe(BigInt(1));
        expect(calculations[0].totalInterest).toBe('49.97');
      });

      it('should include calculation formulas in result', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '3000.00',
          purchaseBalance: '2500.00',
          cashAdvanceBalance: '500.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        const result = await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          false,
          'user123',
        );

        expect(result.purchaseInterestCalculation).toContain('2500.00');
        expect(result.purchaseInterestCalculation).toContain('18.990');
        expect(result.purchaseInterestCalculation).toContain('39.56');
        expect(result.cashAdvanceInterestCalculation).toContain('500.00');
        expect(result.cashAdvanceInterestCalculation).toContain('24.990');
        expect(result.cashAdvanceInterestCalculation).toContain('10.41');
      });

      it('should handle zero purchase balance', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '500.00',
          purchaseBalance: '0.00',
          cashAdvanceBalance: '500.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        const result = await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          false,
          'user123',
        );

        expect(result.purchaseInterest).toBe('0.00');
        expect(result.cashAdvanceInterest).toBe('10.41');
        expect(result.totalInterest).toBe('10.41');
      });

      it('should handle zero cash advance balance', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '2500.00',
          purchaseBalance: '2500.00',
          cashAdvanceBalance: '0.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        const result = await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          false,
          'user123',
        );

        expect(result.purchaseInterest).toBe('39.56');
        expect(result.cashAdvanceInterest).toBe('0.00');
        expect(result.totalInterest).toBe('39.56');
      });

      it('should apply minimum charge when applicable', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '10.00',
          purchaseBalance: '10.00',
          cashAdvanceBalance: '0.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        const result = await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          false,
          'user123',
        );

        expect(result.purchaseInterest).toBe('0.50');
        expect(result.minimumChargeApplied).toBe(true);
        expect(result.totalInterest).toBe('0.50');
      });

      it('should handle suspended account', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.SUSPENDED,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '1000.00',
          purchaseBalance: '1000.00',
          cashAdvanceBalance: '0.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        const result = await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          false,
          'user123',
        );

        expect(result.totalInterest).toBe('15.83');
      });
    });

    describe('applying interest to account', () => {
      it('should update account balance when applyToAccount is true', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '3000.00',
          purchaseBalance: '2500.00',
          cashAdvanceBalance: '500.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        const result = await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          true,
          'user123',
        );

        const updatedBalance = accountRepo.getBalance(BigInt(1));
        expect(updatedBalance!.currentBalance).toBe('3049.97');
        expect(updatedBalance!.lastInterestAmount).toBe('49.97');
        expect(updatedBalance!.version).toBe(BigInt(2));
        expect(result.appliedToAccount).toBe(true);
      });

      it('should log audit entry when applying interest', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '3000.00',
          purchaseBalance: '2500.00',
          cashAdvanceBalance: '500.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          true,
          'user123',
        );

        const auditEntry = auditService.getLastEntry();
        expect(auditEntry).not.toBeNull();
        expect(auditEntry!.action).toBe('UPDATE');
        expect(auditEntry!.entityType).toBe('ACCOUNT_BALANCE');
        expect(auditEntry!.entityId).toBe('ACC12345678');
        expect(auditEntry!.fieldName).toBe('current_balance');
        expect(auditEntry!.oldValue).toBe('3000.00');
        expect(auditEntry!.newValue).toBe('3049.97');
      });

      it('should not update balance when applyToAccount is false', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '3000.00',
          purchaseBalance: '2500.00',
          cashAdvanceBalance: '500.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        const result = await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          false,
          'user123',
        );

        const updatedBalance = accountRepo.getBalance(BigInt(1));
        expect(updatedBalance!.currentBalance).toBe('3000.00');
        expect(updatedBalance!.lastInterestAmount).toBeNull();
        expect(updatedBalance!.version).toBe(BigInt(1));
        expect(result.appliedToAccount).toBe(false);
      });

      it('should not log audit when not applying interest', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '3000.00',
          purchaseBalance: '2500.00',
          cashAdvanceBalance: '500.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          false,
          'user123',
        );

        expect(auditService.getEntries().length).toBe(0);
      });
    });

    describe('error handling', () => {
      it('should throw NotFoundError when account does not exist', async () => {
        await expect(
          service.calculateInterest(
            'ACC12345678',
            new Date('2026-03-15'),
            false,
            'user123',
          ),
        ).rejects.toThrow(NotFoundError);
      });

      it('should throw UnprocessableEntityError when account is closed', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.CLOSED,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        accountRepo.addAccount(account);

        await expect(
          service.calculateInterest(
            'ACC12345678',
            new Date('2026-03-15'),
            false,
            'user123',
          ),
        ).rejects.toThrow(UnprocessableEntityError);
      });

      it('should throw UnprocessableEntityError when no disclosure group', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        accountRepo.addAccount(account);

        await expect(
          service.calculateInterest(
            'ACC12345678',
            new Date('2026-03-15'),
            false,
            'user123',
          ),
        ).rejects.toThrow(UnprocessableEntityError);
      });

      it('should throw InternalServerError when balance not found', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        accountRepo.addAccount(account);

        await expect(
          service.calculateInterest(
            'ACC12345678',
            new Date('2026-03-15'),
            false,
            'user123',
          ),
        ).rejects.toThrow(InternalServerError);
      });

      it('should throw UnprocessableEntityError when purchase rate missing', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '3000.00',
          purchaseBalance: '2500.00',
          cashAdvanceBalance: '500.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        await expect(
          service.calculateInterest(
            'ACC12345678',
            new Date('2026-03-15'),
            false,
            'user123',
          ),
        ).rejects.toThrow(UnprocessableEntityError);
      });

      it('should throw UnprocessableEntityError when cash advance rate missing', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '3000.00',
          purchaseBalance: '2500.00',
          cashAdvanceBalance: '500.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        await expect(
          service.calculateInterest(
            'ACC12345678',
            new Date('2026-03-15'),
            false,
            'user123',
          ),
        ).rejects.toThrow(UnprocessableEntityError);
      });

      it('should throw ServiceUnavailableError when rate service fails', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '3000.00',
          purchaseBalance: '2500.00',
          cashAdvanceBalance: '500.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setShouldFail(true);

        await expect(
          service.calculateInterest(
            'ACC12345678',
            new Date('2026-03-15'),
            false,
            'user123',
          ),
        ).rejects.toThrow(ServiceUnavailableError);
      });
    });

    describe('edge cases', () => {
      it('should handle large balance values', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '999999.99',
          purchaseBalance: '999999.99',
          cashAdvanceBalance: '0.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        const result = await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          false,
          'user123',
        );

        expect(result.purchaseInterest).toBe('15825.00');
      });

      it('should handle different calculation dates', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '1000.00',
          purchaseBalance: '1000.00',
          cashAdvanceBalance: '0.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        const result = await service.calculateInterest(
          'ACC12345678',
          new Date('2026-02-28'),
          false,
          'user123',
        );

        expect(result.calculationDate).toEqual(new Date('2026-02-28'));
      });

      it('should preserve calculation timestamp', async () => {
        const account: Account = {
          id: BigInt(1),
          accountId: 'ACC12345678',
          status: AccountStatus.ACTIVE,
          disclosureGroupId: BigInt(100),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const balance: AccountBalance = {
          id: BigInt(1),
          accountId: BigInt(1),
          currentBalance: '1000.00',
          purchaseBalance: '1000.00',
          cashAdvanceBalance: '0.00',
          lastInterestAmount: null,
          lastInterestDate: null,
          version: BigInt(1),
          updatedAt: new Date(),
        };

        const rates: InterestRate[] = [
          { rateType: 'PURCHASE', rate: '18.990' },
          { rateType: 'CASH_ADVANCE', rate: '24.990' },
        ];

        accountRepo.addAccount(account);
        accountRepo.addBalance(BigInt(1), balance);
        rateClient.setRates(BigInt(100), rates);

        const before = new Date();
        const result = await service.calculateInterest(
          'ACC12345678',
          new Date('2026-03-15'),
          false,
          'user123',
        );
        const after = new Date();

        expect(result.calculatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(result.calculatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
      });
    });
  });
});
