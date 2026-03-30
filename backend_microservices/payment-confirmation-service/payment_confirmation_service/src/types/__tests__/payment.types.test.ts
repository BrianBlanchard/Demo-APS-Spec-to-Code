import { PaymentConfirmation, ErrorResponse, PaymentMethod, PaymentStatus } from '../payment.types';

describe('Payment Types', () => {
  describe('PaymentMethod type', () => {
    it('should accept valid payment method values', () => {
      const eft: PaymentMethod = 'eft';
      const creditCard: PaymentMethod = 'credit_card';
      const debitCard: PaymentMethod = 'debit_card';

      expect(eft).toBe('eft');
      expect(creditCard).toBe('credit_card');
      expect(debitCard).toBe('debit_card');
    });
  });

  describe('PaymentStatus type', () => {
    it('should accept valid payment status values', () => {
      const posted: PaymentStatus = 'posted';
      const pending: PaymentStatus = 'pending';
      const failed: PaymentStatus = 'failed';

      expect(posted).toBe('posted');
      expect(pending).toBe('pending');
      expect(failed).toBe('failed');
    });
  });

  describe('PaymentConfirmation interface', () => {
    it('should accept a valid payment confirmation object', () => {
      const confirmation: PaymentConfirmation = {
        paymentConfirmationNumber: 'PAY-20240115-ABC123',
        transactionId: '1234567890123456',
        accountId: '12345678901',
        paymentAmount: 2450.75,
        paymentMethod: 'eft',
        previousBalance: 2450.75,
        newBalance: 0.0,
        paymentDate: '2024-01-15',
        status: 'posted',
      };

      expect(confirmation.paymentConfirmationNumber).toBe('PAY-20240115-ABC123');
      expect(confirmation.transactionId).toBe('1234567890123456');
      expect(confirmation.accountId).toBe('12345678901');
      expect(confirmation.paymentAmount).toBe(2450.75);
      expect(confirmation.paymentMethod).toBe('eft');
      expect(confirmation.previousBalance).toBe(2450.75);
      expect(confirmation.newBalance).toBe(0.0);
      expect(confirmation.paymentDate).toBe('2024-01-15');
      expect(confirmation.status).toBe('posted');
    });

    it('should support all payment methods', () => {
      const eftPayment: PaymentConfirmation = {
        paymentConfirmationNumber: 'PAY-20240115-ABC123',
        transactionId: '1234567890123456',
        accountId: '12345678901',
        paymentAmount: 100.0,
        paymentMethod: 'eft',
        previousBalance: 100.0,
        newBalance: 0.0,
        paymentDate: '2024-01-15',
        status: 'posted',
      };

      const creditCardPayment: PaymentConfirmation = {
        ...eftPayment,
        paymentMethod: 'credit_card',
      };

      const debitCardPayment: PaymentConfirmation = {
        ...eftPayment,
        paymentMethod: 'debit_card',
      };

      expect(eftPayment.paymentMethod).toBe('eft');
      expect(creditCardPayment.paymentMethod).toBe('credit_card');
      expect(debitCardPayment.paymentMethod).toBe('debit_card');
    });

    it('should support all payment statuses', () => {
      const basePayment: PaymentConfirmation = {
        paymentConfirmationNumber: 'PAY-20240115-ABC123',
        transactionId: '1234567890123456',
        accountId: '12345678901',
        paymentAmount: 100.0,
        paymentMethod: 'eft',
        previousBalance: 100.0,
        newBalance: 0.0,
        paymentDate: '2024-01-15',
        status: 'posted',
      };

      const postedPayment: PaymentConfirmation = { ...basePayment, status: 'posted' };
      const pendingPayment: PaymentConfirmation = { ...basePayment, status: 'pending' };
      const failedPayment: PaymentConfirmation = { ...basePayment, status: 'failed' };

      expect(postedPayment.status).toBe('posted');
      expect(pendingPayment.status).toBe('pending');
      expect(failedPayment.status).toBe('failed');
    });
  });

  describe('ErrorResponse interface', () => {
    it('should accept a valid error response object', () => {
      const error: ErrorResponse = {
        errorCode: 'PAYMENT_NOT_FOUND',
        message: 'Payment confirmation not found',
        timestamp: '2024-01-15T10:30:00Z',
        traceId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(error.errorCode).toBe('PAYMENT_NOT_FOUND');
      expect(error.message).toBe('Payment confirmation not found');
      expect(error.timestamp).toBe('2024-01-15T10:30:00Z');
      expect(error.traceId).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should support various error codes', () => {
      const notFoundError: ErrorResponse = {
        errorCode: 'PAYMENT_NOT_FOUND',
        message: 'Not found',
        timestamp: '2024-01-15T10:30:00Z',
        traceId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const forbiddenError: ErrorResponse = {
        errorCode: 'FORBIDDEN',
        message: 'Forbidden',
        timestamp: '2024-01-15T10:30:00Z',
        traceId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const validationError: ErrorResponse = {
        errorCode: 'VALIDATION_ERROR',
        message: 'Validation failed',
        timestamp: '2024-01-15T10:30:00Z',
        traceId: '550e8400-e29b-41d4-a716-446655440000',
      };

      expect(notFoundError.errorCode).toBe('PAYMENT_NOT_FOUND');
      expect(forbiddenError.errorCode).toBe('FORBIDDEN');
      expect(validationError.errorCode).toBe('VALIDATION_ERROR');
    });
  });
});
