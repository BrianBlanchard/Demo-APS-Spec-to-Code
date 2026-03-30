import { AccountStatus } from '../types/account-status.type';

export interface AccountEntity {
  accountId: string;
  customerId: string;
  status: AccountStatus;
  currentBalance: number;
  creditLimit: number;
  availableCredit: number;
  createdAt: Date;
  updatedAt: Date;
}
