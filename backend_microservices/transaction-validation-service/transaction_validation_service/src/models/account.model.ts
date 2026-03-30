export enum AccountStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  SUSPENDED = 'suspended',
}

export interface Account {
  accountId: string;
  creditLimit: number;
  currentBalance: number;
  availableCashCredit: number;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountWithCredit extends Account {
  availableCredit: number;
}
