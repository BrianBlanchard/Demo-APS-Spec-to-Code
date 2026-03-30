import { AccountStatus } from '../enums/account-status.enum';
import { StatusChangeReason } from '../enums/status-change-reason.enum';

export interface CascadedCard {
  cardNumber: string;
  previousStatus: string;
  newStatus: string;
}

export interface StatusUpdateResponse {
  accountId: string;
  previousStatus: AccountStatus;
  newStatus: AccountStatus;
  reason: StatusChangeReason;
  effectiveDate: Date;
  updatedBy: string;
  cascadedCards: CascadedCard[];
  notificationSent: boolean;
}
