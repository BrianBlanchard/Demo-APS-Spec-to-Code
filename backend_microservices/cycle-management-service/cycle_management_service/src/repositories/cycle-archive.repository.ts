import { Knex } from 'knex';
import { CycleArchive } from '../types/billing.types';
import { DatabaseError } from '../utils/errors.util';

export interface ICycleArchiveRepository {
  create(archive: Omit<CycleArchive, 'id' | 'createdAt'>): Promise<CycleArchive>;
  findByBillingCycle(billingCycle: string): Promise<CycleArchive[]>;
}

export class CycleArchiveRepository implements ICycleArchiveRepository {
  constructor(private readonly db: Knex) {}

  async create(archive: Omit<CycleArchive, 'id' | 'createdAt'>): Promise<CycleArchive> {
    try {
      const [created] = await this.db('cycle_archives')
        .insert({
          account_id: archive.accountId,
          billing_cycle: archive.billingCycle,
          cycle_credit: archive.cycleCredit,
          cycle_debit: archive.cycleDebit,
          interest_charged: archive.interestCharged,
          fees_charged: archive.feesCharged,
          processing_date: archive.processingDate,
        })
        .returning('*');

      return this.mapToCycleArchive(created);
    } catch (error) {
      throw new DatabaseError('Failed to create cycle archive', { error });
    }
  }

  async findByBillingCycle(billingCycle: string): Promise<CycleArchive[]> {
    try {
      const archives = await this.db('cycle_archives')
        .select('*')
        .where('billing_cycle', billingCycle);

      return archives.map(this.mapToCycleArchive);
    } catch (error) {
      throw new DatabaseError('Failed to fetch cycle archives', { error });
    }
  }

  private mapToCycleArchive(row: any): CycleArchive {
    return {
      id: row.id,
      accountId: row.account_id,
      billingCycle: row.billing_cycle,
      cycleCredit: parseFloat(row.cycle_credit),
      cycleDebit: parseFloat(row.cycle_debit),
      interestCharged: parseFloat(row.interest_charged),
      feesCharged: parseFloat(row.fees_charged),
      processingDate: row.processing_date,
      createdAt: row.created_at,
    };
  }
}
