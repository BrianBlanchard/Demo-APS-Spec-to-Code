export interface AccountBalance {
  accountId: string;
  currentBalance: number;
  creditLimit: number;
  availableCredit: number;
  cashCreditLimit: number;
  availableCashCredit: number;
  currentCycleCredit: number;
  currentCycleDebit: number;
  cycleStartDate: string;
  cycleEndDate: string;
  lastTransactionDate: string;
  lastUpdatedAt: string;
}

export interface BalanceUpdateRequest {
  transactionId: string;
  transactionType: TransactionType;
  amount: number;
  isDebit: boolean;
  timestamp: string;
}

export interface BalanceUpdateResponse {
  accountId: string;
  previousBalance: number;
  newBalance: number;
  transactionId: string;
  availableCredit: number;
  updatedAt: string;
}

export enum TransactionType {
  PURCHASE = 'purchase',
  PAYMENT = 'payment',
  CASH_ADVANCE = 'cash_advance',
  REFUND = 'refund',
  FEE = 'fee',
  INTEREST = 'interest',
}

export interface AccountBalanceEntity {
  account_id: string;
  current_balance: number;
  credit_limit: number;
  cash_credit_limit: number;
  current_cycle_credit: number;
  current_cycle_debit: number;
  cycle_start_date: Date;
  cycle_end_date: Date;
  last_transaction_date: Date;
  updated_at: Date;
  version: number;
}

export interface BalanceHistoryEntity {
  history_id: string;
  account_id: string;
  transaction_id: string;
  previous_balance: number;
  new_balance: number;
  amount: number;
  transaction_type: string;
  recorded_at: Date;
}
