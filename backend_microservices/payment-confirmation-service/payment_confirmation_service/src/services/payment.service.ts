import { IPaymentRepository } from '../repositories/payment.repository';
import { PaymentConfirmation } from '../types/payment.types';
import { NotFoundError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';

export class PaymentService {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly auditService: AuditService
  ) {}

  async getPaymentConfirmation(confirmationNumber: string): Promise<PaymentConfirmation> {
    this.auditService.logEvent({
      action: 'retrieve_payment_confirmation',
      resource: 'payment',
      resourceId: confirmationNumber,
      status: 'success',
    });

    const paymentRecord = await this.paymentRepository.findByConfirmationNumber(
      confirmationNumber
    );

    if (!paymentRecord) {
      this.auditService.logEvent({
        action: 'retrieve_payment_confirmation',
        resource: 'payment',
        resourceId: confirmationNumber,
        status: 'failure',
        details: { reason: 'not_found' },
      });
      throw new NotFoundError('Payment confirmation not found');
    }

    this.auditService.logEvent({
      action: 'retrieve_payment_confirmation',
      resource: 'payment',
      resourceId: confirmationNumber,
      status: 'success',
      details: {
        accountId: paymentRecord.account_id,
        paymentAmount: paymentRecord.payment_amount,
        status: paymentRecord.status,
      },
    });

    return this.mapToPaymentConfirmation(paymentRecord);
  }

  private mapToPaymentConfirmation(record: any): PaymentConfirmation {
    return {
      paymentConfirmationNumber: record.payment_confirmation_number,
      transactionId: record.transaction_id,
      accountId: record.account_id,
      paymentAmount: parseFloat(record.payment_amount),
      paymentMethod: record.payment_method,
      previousBalance: parseFloat(record.previous_balance),
      newBalance: parseFloat(record.new_balance),
      paymentDate: record.payment_date,
      status: record.status,
    };
  }
}
