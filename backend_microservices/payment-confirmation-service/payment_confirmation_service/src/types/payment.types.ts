export type PaymentMethod = 'eft' | 'credit_card' | 'debit_card';
export type PaymentStatus = 'posted' | 'pending' | 'failed';

export interface PaymentConfirmation {
  paymentConfirmationNumber: string;
  transactionId: string;
  accountId: string;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  previousBalance: number;
  newBalance: number;
  paymentDate: string;
  status: PaymentStatus;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
}
