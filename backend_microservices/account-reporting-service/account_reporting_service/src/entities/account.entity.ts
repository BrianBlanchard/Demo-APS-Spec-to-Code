import { AccountStatusValue } from '../types/report.types';

export interface AccountEntity {
  accountId: string;
  status: AccountStatusValue;
  balance: number;
  creditLimit: number;
  lastActivityDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountSummary {
  totalAccounts: number;
  activeAccounts: number;
  suspendedAccounts: number;
  closedAccounts: number;
}
