import { AccountRepository } from '../../src/repositories/accountRepository';
import { AccountStatus } from '../../src/models/entities';
import { Knex } from 'knex';

// Create a callable fake database using a function
function createFakeDatabase(): FakeDatabaseType {
  const tables = new Map<string, unknown[]>();
  const fnCalls: string[] = [];

  tables.set('accounts', []);
  tables.set('account_balances', []);

  const fn = {
    now: () => {
      fnCalls.push('now');
      return new Date();
    },
  };

  const fake = ((tableName: string) => {
    return new FakeKnexBuilder(tableName, fake);
  }) as FakeDatabaseType;

  fake.addRow = (tableName: string, row: unknown): void => {
    const table = tables.get(tableName) || [];
    table.push(row);
    tables.set(tableName, table);
  };

  fake.getData = (tableName: string): unknown[] => {
    return tables.get(tableName) || [];
  };

  fake.fn = fn;
  fake.fnCalls = fnCalls;

  fake.raw = (_query: string): Promise<unknown> => {
    return Promise.resolve({ rows: [{ result: 1 }] });
  };

  return fake;
}

interface FakeDatabaseType {
  (tableName: string): FakeKnexBuilder;
  addRow: (tableName: string, row: unknown) => void;
  getData: (tableName: string) => unknown[];
  fn: { now: () => Date };
  fnCalls: string[];
  raw: (query: string) => Promise<unknown>;
}

class FakeKnexBuilder {
  private tableName: string;
  private whereClause: Record<string, unknown> = {};
  private updateData: Record<string, unknown> = {};

  constructor(tableName: string, private db: FakeDatabaseType) {
    this.tableName = tableName;
  }

  where(conditions: Record<string, unknown>): this {
    this.whereClause = conditions;
    return this;
  }

  first(): Promise<unknown> {
    const data = this.db.getData(this.tableName);
    const match = data.find((row) => {
      return Object.entries(this.whereClause).every(
        ([key, value]) => (row as Record<string, unknown>)[key] === value,
      );
    });
    if (!match) {
      return Promise.resolve(null);
    }
    // Convert snake_case to camelCase like Knex does
    return Promise.resolve(this.toCamelCase(match as Record<string, unknown>));
  }

  private toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase());
      result[camelKey] = value;
    }
    return result;
  }

  update(data: Record<string, unknown>): Promise<number> {
    this.updateData = data;
    // Update fn.now() calls to actual dates
    if (data.updated_at && typeof data.updated_at === 'object') {
      data.updated_at = this.db.fn.now();
    }

    const tableData = this.db.getData(this.tableName);
    let count = 0;
    for (let i = 0; i < tableData.length; i++) {
      const row = tableData[i] as Record<string, unknown>;
      const matches = Object.entries(this.whereClause).every(
        ([key, value]) => row[key] === value,
      );
      if (matches) {
        Object.assign(row, this.updateData);
        count++;
      }
    }
    return Promise.resolve(count);
  }
}

describe('AccountRepository', () => {
  let repository: AccountRepository;
  let fakeDb: FakeDatabaseType;

  beforeEach(() => {
    fakeDb = createFakeDatabase();
    repository = new AccountRepository(fakeDb as unknown as Knex);
  });

  describe('findAccountByAccountId', () => {
    it('should return account when found', async () => {
      fakeDb.addRow('accounts', {
        id: '1',
        account_id: 'ACC12345678',
        status: 'ACTIVE',
        disclosureGroupId: '100',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      const result = await repository.findAccountByAccountId('ACC12345678');

      expect(result).not.toBeNull();
      expect(result!.id).toBe(BigInt(1));
      expect(result!.accountId).toBe('ACC12345678');
      expect(result!.status).toBe(AccountStatus.ACTIVE);
      expect(result!.disclosureGroupId).toBe(BigInt(100));
    });

    it('should return null when account not found', async () => {
      const result = await repository.findAccountByAccountId('ACC99999999');

      expect(result).toBeNull();
    });

    it('should convert id to bigint', async () => {
      fakeDb.addRow('accounts', {
        id: '123456789',
        account_id: 'ACC12345678',
        status: 'ACTIVE',
        disclosureGroupId: '100',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      const result = await repository.findAccountByAccountId('ACC12345678');

      expect(result!.id).toBe(BigInt(123456789));
    });

    it('should convert disclosureGroupId to bigint when present', async () => {
      fakeDb.addRow('accounts', {
        id: '1',
        account_id: 'ACC12345678',
        status: 'ACTIVE',
        disclosureGroupId: '999',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      const result = await repository.findAccountByAccountId('ACC12345678');

      expect(result!.disclosureGroupId).toBe(BigInt(999));
    });

    it('should handle null disclosureGroupId', async () => {
      fakeDb.addRow('accounts', {
        id: '1',
        account_id: 'ACC12345678',
        status: 'ACTIVE',
        disclosureGroupId: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      const result = await repository.findAccountByAccountId('ACC12345678');

      expect(result!.disclosureGroupId).toBeNull();
    });

    it('should handle SUSPENDED status', async () => {
      fakeDb.addRow('accounts', {
        id: '1',
        account_id: 'ACC12345678',
        status: 'SUSPENDED',
        disclosureGroupId: '100',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      const result = await repository.findAccountByAccountId('ACC12345678');

      expect(result!.status).toBe(AccountStatus.SUSPENDED);
    });

    it('should handle CLOSED status', async () => {
      fakeDb.addRow('accounts', {
        id: '1',
        account_id: 'ACC12345678',
        status: 'CLOSED',
        disclosureGroupId: '100',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      });

      const result = await repository.findAccountByAccountId('ACC12345678');

      expect(result!.status).toBe(AccountStatus.CLOSED);
    });

    it('should preserve date fields', async () => {
      const createdAt = new Date('2026-01-15T10:00:00Z');
      const updatedAt = new Date('2026-02-20T15:30:00Z');

      fakeDb.addRow('accounts', {
        id: '1',
        account_id: 'ACC12345678',
        status: 'ACTIVE',
        disclosureGroupId: '100',
        createdAt,
        updatedAt,
      });

      const result = await repository.findAccountByAccountId('ACC12345678');

      expect(result!.createdAt).toEqual(createdAt);
      expect(result!.updatedAt).toEqual(updatedAt);
    });

    it('should query with correct account_id', async () => {
      fakeDb.addRow('accounts', {
        id: '1',
        account_id: 'ACC11111111',
        status: 'ACTIVE',
        disclosureGroupId: '100',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      fakeDb.addRow('accounts', {
        id: '2',
        account_id: 'ACC22222222',
        status: 'ACTIVE',
        disclosureGroupId: '100',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await repository.findAccountByAccountId('ACC22222222');

      expect(result!.id).toBe(BigInt(2));
      expect(result!.accountId).toBe('ACC22222222');
    });
  });

  describe('getAccountBalance', () => {
    it('should return balance when found', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '1',
        currentBalance: '3000.00',
        purchaseBalance: '2500.00',
        cashAdvanceBalance: '500.00',
        lastInterestAmount: '49.97',
        lastInterestDate: new Date('2026-02-15'),
        version: '1',
        updatedAt: new Date('2026-02-15'),
      });

      const result = await repository.getAccountBalance(BigInt(1));

      expect(result).not.toBeNull();
      expect(result!.id).toBe(BigInt(1));
      expect(result!.accountId).toBe(BigInt(1));
      expect(result!.currentBalance).toBe('3000.00');
      expect(result!.purchaseBalance).toBe('2500.00');
      expect(result!.cashAdvanceBalance).toBe('500.00');
      expect(result!.lastInterestAmount).toBe('49.97');
      expect(result!.version).toBe(BigInt(1));
    });

    it('should return null when balance not found', async () => {
      const result = await repository.getAccountBalance(BigInt(999));

      expect(result).toBeNull();
    });

    it('should convert id to bigint', async () => {
      fakeDb.addRow('account_balances', {
        id: '123456',
        account_id: '1',
        currentBalance: '1000.00',
        purchaseBalance: '1000.00',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: '1',
        updatedAt: new Date(),
      });

      const result = await repository.getAccountBalance(BigInt(1));

      expect(result!.id).toBe(BigInt(123456));
    });

    it('should convert accountId to bigint', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '987654',
        currentBalance: '1000.00',
        purchaseBalance: '1000.00',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: '1',
        updatedAt: new Date(),
      });

      const result = await repository.getAccountBalance(BigInt(987654));

      expect(result!.accountId).toBe(BigInt(987654));
    });

    it('should convert version to bigint', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '1',
        currentBalance: '1000.00',
        purchaseBalance: '1000.00',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: '999',
        updatedAt: new Date(),
      });

      const result = await repository.getAccountBalance(BigInt(1));

      expect(result!.version).toBe(BigInt(999));
    });

    it('should handle null lastInterestAmount', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '1',
        currentBalance: '1000.00',
        purchaseBalance: '1000.00',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: '1',
        updatedAt: new Date(),
      });

      const result = await repository.getAccountBalance(BigInt(1));

      expect(result!.lastInterestAmount).toBeNull();
    });

    it('should handle null lastInterestDate', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '1',
        currentBalance: '1000.00',
        purchaseBalance: '1000.00',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: '1',
        updatedAt: new Date(),
      });

      const result = await repository.getAccountBalance(BigInt(1));

      expect(result!.lastInterestDate).toBeNull();
    });

    it('should preserve decimal string precision', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '1',
        currentBalance: '12345.67',
        purchaseBalance: '9999.99',
        cashAdvanceBalance: '2345.68',
        lastInterestAmount: '123.45',
        lastInterestDate: new Date(),
        version: '1',
        updatedAt: new Date(),
      });

      const result = await repository.getAccountBalance(BigInt(1));

      expect(result!.currentBalance).toBe('12345.67');
      expect(result!.purchaseBalance).toBe('9999.99');
      expect(result!.cashAdvanceBalance).toBe('2345.68');
      expect(result!.lastInterestAmount).toBe('123.45');
    });

    it('should query with stringified account_id', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '100',
        currentBalance: '1000.00',
        purchaseBalance: '1000.00',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: '1',
        updatedAt: new Date(),
      });

      fakeDb.addRow('account_balances', {
        id: '2',
        account_id: '200',
        currentBalance: '2000.00',
        purchaseBalance: '2000.00',
        cashAdvanceBalance: '0.00',
        lastInterestAmount: null,
        lastInterestDate: null,
        version: '1',
        updatedAt: new Date(),
      });

      const result = await repository.getAccountBalance(BigInt(200));

      expect(result!.id).toBe(BigInt(2));
      expect(result!.currentBalance).toBe('2000.00');
    });
  });

  describe('updateAccountBalance', () => {
    it('should update balance when version matches', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '1',
        current_balance: '3000.00',
        last_interest_amount: null,
        last_interest_date: null,
        version: '1',
        updated_at: new Date('2026-01-01'),
      });

      await repository.updateAccountBalance(
        BigInt(1),
        '3049.97',
        '49.97',
        new Date('2026-03-15'),
        BigInt(1),
      );

      const data = fakeDb.getData('account_balances');
      expect(data.length).toBe(1);
      const row = data[0] as Record<string, unknown>;
      expect(row.current_balance).toBe('3049.97');
      expect(row.last_interest_amount).toBe('49.97');
      expect(row.version).toBe('2');
    });

    it('should throw error when version does not match', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '1',
        current_balance: '3000.00',
        last_interest_amount: null,
        last_interest_date: null,
        version: '2',
        updated_at: new Date(),
      });

      await expect(
        repository.updateAccountBalance(
          BigInt(1),
          '3049.97',
          '49.97',
          new Date('2026-03-15'),
          BigInt(1),
        ),
      ).rejects.toThrow('Optimistic lock failure');
    });

    it('should throw error when account not found', async () => {
      await expect(
        repository.updateAccountBalance(
          BigInt(999),
          '3049.97',
          '49.97',
          new Date('2026-03-15'),
          BigInt(1),
        ),
      ).rejects.toThrow('Optimistic lock failure');
    });

    it('should increment version by 1', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '1',
        current_balance: '1000.00',
        last_interest_amount: null,
        last_interest_date: null,
        version: '5',
        updated_at: new Date(),
      });

      await repository.updateAccountBalance(
        BigInt(1),
        '1015.83',
        '15.83',
        new Date('2026-03-15'),
        BigInt(5),
      );

      const data = fakeDb.getData('account_balances');
      const row = data[0] as Record<string, unknown>;
      expect(row.version).toBe('6');
    });

    it('should update last_interest_date', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '1',
        current_balance: '1000.00',
        last_interest_amount: null,
        last_interest_date: null,
        version: '1',
        updated_at: new Date(),
      });

      const interestDate = new Date('2026-03-15');
      await repository.updateAccountBalance(
        BigInt(1),
        '1015.83',
        '15.83',
        interestDate,
        BigInt(1),
      );

      const data = fakeDb.getData('account_balances');
      const row = data[0] as Record<string, unknown>;
      expect(row.last_interest_date).toEqual(interestDate);
    });

    it('should call db.fn.now() for updated_at', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '1',
        current_balance: '1000.00',
        last_interest_amount: null,
        last_interest_date: null,
        version: '1',
        updated_at: new Date('2026-01-01'),
      });

      await repository.updateAccountBalance(
        BigInt(1),
        '1015.83',
        '15.83',
        new Date('2026-03-15'),
        BigInt(1),
      );

      expect(fakeDb.fnCalls).toContain('now');
    });

    it('should handle large balance values', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '1',
        current_balance: '999999.99',
        last_interest_amount: null,
        last_interest_date: null,
        version: '1',
        updated_at: new Date(),
      });

      await repository.updateAccountBalance(
        BigInt(1),
        '1015824.99',
        '15825.00',
        new Date('2026-03-15'),
        BigInt(1),
      );

      const data = fakeDb.getData('account_balances');
      const row = data[0] as Record<string, unknown>;
      expect(row.current_balance).toBe('1015824.99');
      expect(row.last_interest_amount).toBe('15825.00');
    });

    it('should stringify bigint parameters for query', async () => {
      fakeDb.addRow('account_balances', {
        id: '1',
        account_id: '12345678901234567890',
        current_balance: '1000.00',
        last_interest_amount: null,
        last_interest_date: null,
        version: '999999999999',
        updated_at: new Date(),
      });

      await repository.updateAccountBalance(
        BigInt('12345678901234567890'),
        '1015.83',
        '15.83',
        new Date('2026-03-15'),
        BigInt('999999999999'),
      );

      const data = fakeDb.getData('account_balances');
      const row = data[0] as Record<string, unknown>;
      expect(row.current_balance).toBe('1015.83');
    });
  });
});
