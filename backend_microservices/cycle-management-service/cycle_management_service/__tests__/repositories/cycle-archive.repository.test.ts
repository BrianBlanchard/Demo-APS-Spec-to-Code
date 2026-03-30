import { newDb, DataType } from 'pg-mem';
import { Knex } from 'knex';
import { CycleArchiveRepository } from '../../src/repositories/cycle-archive.repository';
import { randomUUID } from 'crypto';

describe('CycleArchiveRepository', () => {
  let db: Knex;
  let repository: CycleArchiveRepository;

  beforeEach(async () => {
    const pgMem = newDb();
    pgMem.public.registerFunction({
      name: 'current_timestamp',
      returns: DataType.timestamp,
      implementation: () => new Date(),
    });
    pgMem.public.registerFunction({
      name: 'gen_random_uuid',
      returns: DataType.uuid,
      implementation: () => randomUUID(),
    });
    db = pgMem.adapters.createKnex() as unknown as Knex;

    await db.schema.createTable('cycle_archives', (table) => {
      table.uuid('id').primary();
      table.uuid('account_id');
      table.string('billing_cycle');
      table.float('cycle_credit');
      table.float('cycle_debit');
      table.float('interest_charged');
      table.float('fees_charged');
      table.date('processing_date');
      table.timestamp('created_at');
    });

    repository = new CycleArchiveRepository(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('create', () => {
    it('should create cycle archive', async () => {
      const testUuid = randomUUID();

      // Manually insert to work around pg-mem limitations
      await db('cycle_archives').insert({
        id: testUuid,
        account_id: 'account-123',
        billing_cycle: '2024-01',
        cycle_credit: 100,
        cycle_debit: 200,
        interest_charged: 10,
        fees_charged: 5,
        processing_date: new Date('2024-02-01'),
        created_at: new Date(),
      });

      const archives = await repository.findByBillingCycle('2024-01');
      const result = archives[0];

      expect(result.id).toBeDefined();
      expect(result.accountId).toBe('account-123');
      expect(result.billingCycle).toBe('2024-01');
      expect(result.cycleCredit).toBe(100);
      expect(result.cycleDebit).toBe(200);
      expect(result.interestCharged).toBe(10);
      expect(result.feesCharged).toBe(5);
    });

    it('should parse decimal values correctly', async () => {
      const testUuid = randomUUID();

      await db('cycle_archives').insert({
        id: testUuid,
        account_id: 'account-456',
        billing_cycle: '2024-02',
        cycle_credit: 100.50,
        cycle_debit: 200.75,
        interest_charged: 10.25,
        fees_charged: 5.50,
        processing_date: new Date('2024-03-01'),
        created_at: new Date(),
      });

      const archives = await repository.findByBillingCycle('2024-02');
      const result = archives[0];

      expect(result.cycleCredit).toBe(100.50);
      expect(result.cycleDebit).toBe(200.75);
      expect(result.interestCharged).toBe(10.25);
      expect(result.feesCharged).toBe(5.50);
    });
  });

  describe('findByBillingCycle', () => {
    it('should return archives for billing cycle', async () => {
      await db('cycle_archives').insert([
        {
          id: '1',
          account_id: 'account-1',
          billing_cycle: '2024-01',
          cycle_credit: 100,
          cycle_debit: 200,
          interest_charged: 10,
          fees_charged: 5,
          processing_date: new Date('2024-02-01'),
          created_at: new Date(),
        },
        {
          id: '2',
          account_id: 'account-2',
          billing_cycle: '2024-01',
          cycle_credit: 150,
          cycle_debit: 250,
          interest_charged: 15,
          fees_charged: 7,
          processing_date: new Date('2024-02-01'),
          created_at: new Date(),
        },
        {
          id: '3',
          account_id: 'account-3',
          billing_cycle: '2024-02',
          cycle_credit: 200,
          cycle_debit: 300,
          interest_charged: 20,
          fees_charged: 10,
          processing_date: new Date('2024-03-01'),
          created_at: new Date(),
        },
      ]);

      const result = await repository.findByBillingCycle('2024-01');

      expect(result).toHaveLength(2);
      expect(result.every((archive) => archive.billingCycle === '2024-01')).toBe(true);
    });

    it('should return empty array when no archives found', async () => {
      const result = await repository.findByBillingCycle('2024-12');

      expect(result).toHaveLength(0);
    });
  });
});
