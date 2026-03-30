import { PaymentMethod, PaymentStatus } from '../types/payment.types';

export interface PaymentRecord {
  id: number;
  payment_confirmation_number: string;
  transaction_id: string;
  account_id: string;
  payment_amount: number;
  payment_method: PaymentMethod;
  previous_balance: number;
  new_balance: number;
  payment_date: string;
  status: PaymentStatus;
  created_at: Date;
  updated_at: Date;
}
