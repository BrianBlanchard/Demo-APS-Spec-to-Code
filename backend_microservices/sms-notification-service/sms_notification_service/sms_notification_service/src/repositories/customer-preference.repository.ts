import { Knex } from 'knex';

export interface CustomerPreference {
  id?: number;
  phoneNumber: string;
  smsOptIn: boolean;
  emailOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerPreferenceRepository {
  findByPhoneNumber(phoneNumber: string): Promise<CustomerPreference | null>;
  create(preference: Omit<CustomerPreference, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerPreference>;
}

export class CustomerPreferenceRepository implements ICustomerPreferenceRepository {
  private readonly tableName = 'customer_preferences';

  constructor(private readonly db: Knex) {}

  async findByPhoneNumber(phoneNumber: string): Promise<CustomerPreference | null> {
    const record = await this.db(this.tableName)
      .where({ phone_number: phoneNumber })
      .first();

    return record ? this.mapToModel(record) : null;
  }

  async create(
    preference: Omit<CustomerPreference, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CustomerPreference> {
    const [created] = await this.db(this.tableName)
      .insert({
        phone_number: preference.phoneNumber,
        sms_opt_in: preference.smsOptIn,
        email_opt_in: preference.emailOptIn,
      })
      .returning('*');

    return this.mapToModel(created);
  }

  private mapToModel(row: any): CustomerPreference {
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      smsOptIn: row.sms_opt_in,
      emailOptIn: row.email_opt_in,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
