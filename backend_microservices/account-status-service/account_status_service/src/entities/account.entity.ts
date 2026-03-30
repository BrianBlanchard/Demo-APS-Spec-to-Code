import { AccountStatus } from '../enums/account-status.enum';

export interface Account {
  accountId: string;
  accountStatus: AccountStatus;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
  version: number; // For optimistic locking
}
