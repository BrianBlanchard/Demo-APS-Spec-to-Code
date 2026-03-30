export interface Transaction {
  transactionId: string;
  cardNumber: string;
  accountId: string;
  transactionType: string;
  transactionCategory: string;
  transactionAmount: number;
  merchantId: string;
  merchantName: string;
  merchantCity: string;
  merchantZip: string;
  transactionSource: string;
  transactionDescription: string;
  originalTimestamp: Date;
  postedTimestamp: Date;
  authorizationCode: string;
  validationId: string;
  status: TransactionStatus;
}

export enum TransactionStatus {
  POSTED = 'posted',
  REVERSED = 'reversed',
  ADJUSTED = 'adjusted',
}

export enum TransactionType {
  DEBIT_PURCHASE = '01',
  CREDIT_PAYMENT = '02',
  DEBIT_CASH_ADVANCE = '03',
  DEBIT_FEE = '04',
  DEBIT_INTEREST = '05',
  ADJUSTMENT = '06',
}

export interface Account {
  accountId: string;
  cardNumber: string;
  currentBalance: number;
  availableCredit: number;
  creditLimit: number;
  currentCycleDebit: number;
  currentCycleCredit: number;
  lastTransactionDate: Date | null;
  status: AccountStatus;
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export interface Validation {
  validationId: string;
  authorizationCode: string;
  cardNumber: string;
  amount: number;
  status: ValidationStatus;
}

export enum ValidationStatus {
  APPROVED = 'approved',
  DECLINED = 'declined',
  PENDING = 'pending',
}

export interface BalanceUpdate {
  accountId: string;
  previousBalance: number;
  newBalance: number;
  availableCredit: number;
  transactionAmount: number;
  transactionType: string;
}
