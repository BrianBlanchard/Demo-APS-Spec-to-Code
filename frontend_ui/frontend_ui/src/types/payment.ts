// Payment types
export interface Payment {
  paymentId?: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  description?: string;
  paymentDate: string;
  status?: string;
}

export interface PaymentConfirmation {
  paymentId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  transactionReference: string;
  timestamp: string;
}
