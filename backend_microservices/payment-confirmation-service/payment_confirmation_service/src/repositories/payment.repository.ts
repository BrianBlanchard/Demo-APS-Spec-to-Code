import { Knex } from 'knex';
import { PaymentRecord } from '../models/payment.model';

export interface IPaymentRepository {
  findByConfirmationNumber(confirmationNumber: string): Promise<PaymentRecord | null>;
}

export class PaymentRepository implements IPaymentRepository {
  private readonly tableName = 'payments';

  constructor(private readonly db: Knex) {}

  async findByConfirmationNumber(confirmationNumber: string): Promise<PaymentRecord | null> {
    const record = await this.db<PaymentRecord>(this.tableName)
      .where('payment_confirmation_number', confirmationNumber)
      .first();

    return record || null;
  }
}
