import { AccountStatus } from '../enums/account-status.enum';
import { StatusChangeReason } from '../enums/status-change-reason.enum';

export interface AccountStatusHistory {
  historyId: string;
  accountId: string;
  previousStatus: AccountStatus;
  newStatus: AccountStatus;
  reasonCode: StatusChangeReason;
  notes: string | null;
  changedAt: Date;
  changedBy: string;
  notifyCustomer: boolean;
  ipAddress: string;
}
