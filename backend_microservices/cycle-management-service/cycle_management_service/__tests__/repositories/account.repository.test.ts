import { newDb, DataType } from 'pg-mem';
import { Knex } from 'knex';
import { AccountRepository } from '../../src/repositories/account.repository';
import { AccountStatus } from '../../src/types/billing.types';

describe('AccountRepository', () => {
  let db: Knex;
  let repository: AccountRepository;

  beforeEach(async () => {
    const pgMem = newDb();
    pgMem.public.registerFunction({
      name: 'current_timestamp',
      returns: DataType.timestamp,
      implementation: () => new Date(),
    });
    db = pgMem.adapters.createKnex() as unknown as Knex;

    await db.schema.createTable('accounts', (table) => {
      table.uuid('id').primary();
      table.string('account_number').unique();
      table.float('current_cycle_credit');
      table.float('current_cycle_debit');
      table.string('status');
      table.timestamp('created_at');
      table.timestamp('updated_at');
    });

    repository = new AccountRepository(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('findActiveAccounts', () => {
    it('should return active accounts only', async () => {
      await db('accounts').insert([
        {
          id: '1',
          account_number: '123',
          current_cycle_credit: 100,
          current_cycle_debit: 200,
          status: AccountStatus.ACTIVE,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          account_number: '456',
          current_cycle_credit: 150,
          current_cycle_debit: 250,
          status: AccountStatus.CLOSED,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '3',
          account_number: '789',
          current_cycle_credit: 200,
          current_cycle_debit: 300,
          status: AccountStatus.ACTIVE,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      const result = await repository.findActiveAccounts();

      expect(result).toHaveLength(2);
      expect(result.every((account) => account.status === AccountStatus.ACTIVE)).toBe(true);
    });

    it('should return empty array when no active accounts', async () => {
      await db('accounts').insert({
        id: '1',
        account_number: '123',
        current_cycle_credit: 100,
        current_cycle_debit: 200,
        status: AccountStatus.CLOSED,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await repository.findActiveAccounts();

      expect(result).toHaveLength(0);
    });

    it('should parse numeric values correctly', async () => {
      await db('accounts').insert({
        id: '1',
        account_number: '123',
        current_cycle_credit: '100.50',
        current_cycle_debit: '200.75',
        status: AccountStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await repository.findActiveAccounts();

      expect(result[0].currentCycleCredit).toBe(100.50);
      expect(result[0].currentCycleDebit).toBe(200.75);
    });
  });

  describe('findById', () => {
    it('should return account when found', async () => {
      await db('accounts').insert({
        id: 'test-id',
        account_number: '123456',
        current_cycle_credit: 100,
        current_cycle_debit: 200,
        status: AccountStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const result = await repository.findById('test-id');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-id');
      expect(result?.accountNumber).toBe('123456');
    });

    it('should return null when account not found', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('resetCycleCounters', () => {
    it('should reset cycle counters to zero', async () => {
      await db('accounts').insert({
        id: 'test-id',
        account_number: '123',
        current_cycle_credit: 100,
        current_cycle_debit: 200,
        status: AccountStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await repository.resetCycleCounters('test-id');

      const account = await db('accounts').where('id', 'test-id').first();
      expect(parseFloat(account.current_cycle_credit)).toBe(0);
      expect(parseFloat(account.current_cycle_debit)).toBe(0);
    });
  });
});
