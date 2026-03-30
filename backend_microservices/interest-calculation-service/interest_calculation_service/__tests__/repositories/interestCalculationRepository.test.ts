import { InterestCalculationRepository } from '../../src/repositories/interestCalculationRepository';
import { InterestCalculation } from '../../src/models/entities';
import { Knex } from 'knex';

// Test double for Knex database
class FakeDatabase {
  private insertedRows: Array<Record<string, unknown>> = [];

  constructor() {
    // Make the instance callable
    const handler = {
      apply: (_target: unknown, _thisArg: unknown, args: unknown[]): FakeDatabase => {
        return this.call(args[0] as string);
      },
      get: (target: FakeDatabase, prop: string | symbol): unknown => {
        return (target as Record<string | symbol, unknown>)[prop];
      },
    };
    return new Proxy(this, handler) as FakeDatabase;
  }

  call(_tableName: string): this {
    return this;
  }

  async insert(data: Record<string, unknown>): Promise<void> {
    this.insertedRows.push({ ...data });
  }

  getInsertedRows(): Array<Record<string, unknown>> {
    return this.insertedRows;
  }

  getLastInsertedRow(): Record<string, unknown> | null {
    return this.insertedRows.length > 0
      ? this.insertedRows[this.insertedRows.length - 1]
      : null;
  }

  clearInsertedRows(): void {
    this.insertedRows = [];
  }
}

describe('InterestCalculationRepository', () => {
  let repository: InterestCalculationRepository;
  let fakeDb: FakeDatabase;

  beforeEach(() => {
    fakeDb = new FakeDatabase();
    repository = new InterestCalculationRepository(fakeDb as unknown as Knex);
  });

  describe('saveCalculation', () => {
    it('should insert calculation record', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '2500.00',
        purchaseRate: '18.990',
        purchaseInterest: '39.56',
        cashAdvanceBalance: '500.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '10.41',
        totalInterest: '49.97',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const rows = fakeDb.getInsertedRows();
      expect(rows.length).toBe(1);
    });

    it('should convert accountId to string', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt(123456),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '1000.00',
        purchaseRate: '18.990',
        purchaseInterest: '15.83',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '15.83',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.account_id).toBe('123456');
    });

    it('should insert all calculation fields with snake_case', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '2500.00',
        purchaseRate: '18.990',
        purchaseInterest: '39.56',
        cashAdvanceBalance: '500.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '10.41',
        totalInterest: '49.97',
        minimumChargeApplied: false,
        appliedToAccount: true,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.account_id).toBe('1');
      expect(row!.calculation_date).toEqual(new Date('2026-03-15'));
      expect(row!.purchase_balance).toBe('2500.00');
      expect(row!.purchase_rate).toBe('18.990');
      expect(row!.purchase_interest).toBe('39.56');
      expect(row!.cash_advance_balance).toBe('500.00');
      expect(row!.cash_advance_rate).toBe('24.990');
      expect(row!.cash_advance_interest).toBe('10.41');
      expect(row!.total_interest).toBe('49.97');
      expect(row!.minimum_charge_applied).toBe(false);
      expect(row!.applied_to_account).toBe(true);
      expect(row!.calculated_at).toEqual(new Date('2026-03-27T10:00:00Z'));
      expect(row!.calculated_by).toBe('user123');
    });

    it('should handle minimum charge applied', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '10.00',
        purchaseRate: '18.990',
        purchaseInterest: '0.50',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '0.50',
        minimumChargeApplied: true,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.minimum_charge_applied).toBe(true);
      expect(row!.total_interest).toBe('0.50');
    });

    it('should handle applied to account true', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '1000.00',
        purchaseRate: '18.990',
        purchaseInterest: '15.83',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '15.83',
        minimumChargeApplied: false,
        appliedToAccount: true,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.applied_to_account).toBe(true);
    });

    it('should handle applied to account false', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '1000.00',
        purchaseRate: '18.990',
        purchaseInterest: '15.83',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '15.83',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.applied_to_account).toBe(false);
    });

    it('should preserve decimal precision', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '12345.67',
        purchaseRate: '18.990',
        purchaseInterest: '195.44',
        cashAdvanceBalance: '9876.54',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '205.60',
        totalInterest: '401.04',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.purchase_balance).toBe('12345.67');
      expect(row!.purchase_interest).toBe('195.44');
      expect(row!.cash_advance_balance).toBe('9876.54');
      expect(row!.cash_advance_interest).toBe('205.60');
      expect(row!.total_interest).toBe('401.04');
    });

    it('should preserve rate precision', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '1000.00',
        purchaseRate: '18.990',
        purchaseInterest: '15.83',
        cashAdvanceBalance: '500.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '10.41',
        totalInterest: '26.24',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.purchase_rate).toBe('18.990');
      expect(row!.cash_advance_rate).toBe('24.990');
    });

    it('should handle zero balances', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '0.00',
        purchaseRate: '18.990',
        purchaseInterest: '0.00',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '0.00',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.purchase_balance).toBe('0.00');
      expect(row!.cash_advance_balance).toBe('0.00');
      expect(row!.total_interest).toBe('0.00');
    });

    it('should handle large account IDs', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt('12345678901234567890'),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '1000.00',
        purchaseRate: '18.990',
        purchaseInterest: '15.83',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '15.83',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.account_id).toBe('12345678901234567890');
    });

    it('should preserve date and timestamp fields', async () => {
      const calculationDate = new Date('2026-03-15T00:00:00Z');
      const calculatedAt = new Date('2026-03-27T10:30:45.123Z');

      const calculation: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate,
        purchaseBalance: '1000.00',
        purchaseRate: '18.990',
        purchaseInterest: '15.83',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '15.83',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt,
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.calculation_date).toEqual(calculationDate);
      expect(row!.calculated_at).toEqual(calculatedAt);
    });

    it('should handle different user identifiers', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '1000.00',
        purchaseRate: '18.990',
        purchaseInterest: '15.83',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '15.83',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'system',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.calculated_by).toBe('system');
    });

    it('should handle multiple saves', async () => {
      const calculation1: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '1000.00',
        purchaseRate: '18.990',
        purchaseInterest: '15.83',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '15.83',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      const calculation2: InterestCalculation = {
        accountId: BigInt(2),
        calculationDate: new Date('2026-03-16'),
        purchaseBalance: '2000.00',
        purchaseRate: '18.990',
        purchaseInterest: '31.65',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '31.65',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T11:00:00Z'),
        calculatedBy: 'user456',
      };

      await repository.saveCalculation(calculation1);
      await repository.saveCalculation(calculation2);

      const rows = fakeDb.getInsertedRows();
      expect(rows.length).toBe(2);
      expect(rows[0].account_id).toBe('1');
      expect(rows[1].account_id).toBe('2');
    });

    it('should not include id field in insert', async () => {
      const calculation: InterestCalculation = {
        id: BigInt(999),
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '1000.00',
        purchaseRate: '18.990',
        purchaseInterest: '15.83',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '15.83',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.id).toBeUndefined();
    });

    it('should handle large interest values', async () => {
      const calculation: InterestCalculation = {
        accountId: BigInt(1),
        calculationDate: new Date('2026-03-15'),
        purchaseBalance: '999999.99',
        purchaseRate: '18.990',
        purchaseInterest: '15825.00',
        cashAdvanceBalance: '0.00',
        cashAdvanceRate: '24.990',
        cashAdvanceInterest: '0.00',
        totalInterest: '15825.00',
        minimumChargeApplied: false,
        appliedToAccount: false,
        calculatedAt: new Date('2026-03-27T10:00:00Z'),
        calculatedBy: 'user123',
      };

      await repository.saveCalculation(calculation);

      const row = fakeDb.getLastInsertedRow();
      expect(row!.purchase_balance).toBe('999999.99');
      expect(row!.purchase_interest).toBe('15825.00');
      expect(row!.total_interest).toBe('15825.00');
    });
  });
});
