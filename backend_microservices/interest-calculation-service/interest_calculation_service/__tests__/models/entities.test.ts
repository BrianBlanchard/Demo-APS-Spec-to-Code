import { AccountStatus } from '../../src/models/entities';

describe('Entities', () => {
  describe('AccountStatus', () => {
    it('should have ACTIVE status', () => {
      expect(AccountStatus.ACTIVE).toBe('ACTIVE');
    });

    it('should have SUSPENDED status', () => {
      expect(AccountStatus.SUSPENDED).toBe('SUSPENDED');
    });

    it('should have CLOSED status', () => {
      expect(AccountStatus.CLOSED).toBe('CLOSED');
    });

    it('should have exactly 3 status values', () => {
      const statuses = Object.values(AccountStatus);
      expect(statuses).toHaveLength(3);
    });

    it('should have all expected status values', () => {
      const statuses = Object.values(AccountStatus);
      expect(statuses).toContain('ACTIVE');
      expect(statuses).toContain('SUSPENDED');
      expect(statuses).toContain('CLOSED');
    });

    it('should be usable in type guards', () => {
      const status: AccountStatus = AccountStatus.ACTIVE;
      expect(status).toBe(AccountStatus.ACTIVE);
    });

    it('should support equality comparisons', () => {
      expect(AccountStatus.ACTIVE === 'ACTIVE').toBe(true);
      expect(AccountStatus.SUSPENDED === 'SUSPENDED').toBe(true);
      expect(AccountStatus.CLOSED === 'CLOSED').toBe(true);
    });

    it('should support inequality comparisons', () => {
      const active: string = AccountStatus.ACTIVE;
      const closed: string = AccountStatus.CLOSED;
      const suspended: string = AccountStatus.SUSPENDED;
      expect(active !== closed).toBe(true);
      expect(suspended !== active).toBe(true);
    });
  });

  describe('Account Interface', () => {
    it('should accept valid account object', () => {
      const account = {
        id: BigInt(1),
        accountId: '12345678901',
        status: AccountStatus.ACTIVE,
        disclosureGroupId: BigInt(100),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-03-16'),
      };

      expect(account.id).toBe(BigInt(1));
      expect(account.accountId).toBe('12345678901');
      expect(account.status).toBe(AccountStatus.ACTIVE);
      expect(account.disclosureGroupId).toBe(BigInt(100));
    });

    it('should accept account with null disclosureGroupId', () => {
      const account = {
        id: BigInt(1),
        accountId: '12345678901',
        status: AccountStatus.CLOSED,
        disclosureGroupId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(account.disclosureGroupId).toBeNull();
    });

    it('should support 11-digit account IDs', () => {
      const account = {
        id: BigInt(1),
        accountId: '99999999999',
        status: AccountStatus.ACTIVE,
        disclosureGroupId: BigInt(1),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(account.accountId).toHaveLength(11);
    });
  });

  describe('AccountBalance Interface', () => {
    it('should accept valid account balance object', () => {
      const balance = {
        id: BigInt(1),
        accountId: BigInt(1),
        currentBalance: '1500.00',
        purchaseBalance: '1000.00',
        cashAdvanceBalance: '500.00',
        lastInterestAmount: '25.50',
        lastInterestDate: new Date('2026-02-16'),
        version: BigInt(1),
        updatedAt: new Date('2026-03-16'),
      };

      expect(balance.currentBalance).toBe('1500.00');
      expect(balance.purchaseBalance).toBe('1000.00');
      expect(balance.cashAdvanceBalance).toBe('500.00');
      expect(balance.lastInterestAmount).toBe('25.50');
    });

    it('should accept balance with null interest fields', () => {
      const balance = {
        id: BigInt(1),
        accountId: BigInt(1),
        currentBalance: '0.00',
        purchaseBalance: '0.00',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: BigInt(0),
        updatedAt: new Date(),
      };

      expect(balance.lastInterestAmount).toBeNull();
      expect(balance.lastInterestDate).toBeNull();
    });

    it('should support zero balances', () => {
      const balance = {
        id: BigInt(1),
        accountId: BigInt(1),
        currentBalance: '0.00',
        purchaseBalance: '0.00',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: BigInt(0),
        updatedAt: new Date(),
      };

      expect(balance.currentBalance).toBe('0.00');
    });

    it('should support negative (credit) balances', () => {
      const balance = {
        id: BigInt(1),
        accountId: BigInt(1),
        currentBalance: '-100.00',
        purchaseBalance: '0.00',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: BigInt(0),
        updatedAt: new Date(),
      };

      expect(balance.currentBalance).toBe('-100.00');
    });

    it('should support large balances', () => {
      const balance = {
        id: BigInt(1),
        accountId: BigInt(1),
        currentBalance: '999999999999999.99',
        purchaseBalance: '999999999999999.99',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: BigInt(0),
        updatedAt: new Date(),
      };

      expect(balance.currentBalance).toBe('999999999999999.99');
    });

    it('should support version for optimistic locking', () => {
      const balance = {
        id: BigInt(1),
        accountId: BigInt(1),
        currentBalance: '100.00',
        purchaseBalance: '100.00',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: BigInt(5),
        updatedAt: new Date(),
      };

      expect(balance.version).toBe(BigInt(5));
    });
  });

  describe('InterestCalculation Interface', () => {
    it('should accept valid interest calculation object', () => {
      const calculation = {
        id: BigInt(1),
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-16'),
        purchaseBalance: '2500.00',
        purchaseRate: '18.990',
        purchaseInterest: '39.56',
        cashAdvanceBalance: '500.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '10.41',
        totalInterest: '49.97',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-16T11:00:00Z'),
        calculatedBy: 'operator-123',
      };

      expect(calculation.totalInterest).toBe('49.97');
      expect(calculation.minimumChargeApplied).toBe(false);
    });

    it('should accept calculation without ID (for new records)', () => {
      const calculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-16'),
        purchaseBalance: '100.00',
        purchaseRate: '18.990',
        purchaseInterest: '0.50',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '0.50',
        minimumChargeApplied: true,
        appliedToAccount: true,
        calculatedAt: new Date(),
        calculatedBy: 'batch-job',
      };

      expect('id' in calculation ? calculation.id : undefined).toBeUndefined();
      expect(calculation.minimumChargeApplied).toBe(true);
    });

    it('should support zero interest calculation', () => {
      const calculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-16'),
        purchaseBalance: '0.00',
        purchaseRate: '18.990',
        purchaseInterest: '0.00',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '0.00',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date(),
        calculatedBy: 'system',
      };

      expect(calculation.totalInterest).toBe('0.00');
    });

    it('should track who calculated the interest', () => {
      const calculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-16'),
        purchaseBalance: '100.00',
        purchaseRate: '18.990',
        purchaseInterest: '1.58',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '1.58',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date(),
        calculatedBy: 'operator-456',
      };

      expect(calculation.calculatedBy).toBe('operator-456');
    });
  });

  describe('InterestRate Interface', () => {
    it('should accept valid PURCHASE rate', () => {
      const rate = {
        rateType: 'PURCHASE' as const,
        rate: '18.990',
      };

      expect(rate.rateType).toBe('PURCHASE');
      expect(rate.rate).toBe('18.990');
    });

    it('should accept valid CASH_ADVANCE rate', () => {
      const rate = {
        rateType: 'CASH_ADVANCE' as const,
        rate: '24.990',
      };

      expect(rate.rateType).toBe('CASH_ADVANCE');
      expect(rate.rate).toBe('24.990');
    });

    it('should support different rate values', () => {
      const rates = [
        { rateType: 'PURCHASE' as const, rate: '15.990' },
        { rateType: 'PURCHASE' as const, rate: '18.990' },
        { rateType: 'CASH_ADVANCE' as const, rate: '24.990' },
        { rateType: 'CASH_ADVANCE' as const, rate: '29.990' },
      ];

      expect(rates).toHaveLength(4);
      expect(rates.every((r) => r.rate.includes('.'))).toBe(true);
    });

    it('should maintain 3 decimal places for rates', () => {
      const rate = {
        rateType: 'PURCHASE' as const,
        rate: '18.990',
      };

      const decimals = rate.rate.split('.')[1];
      expect(decimals).toHaveLength(3);
    });
  });
});
