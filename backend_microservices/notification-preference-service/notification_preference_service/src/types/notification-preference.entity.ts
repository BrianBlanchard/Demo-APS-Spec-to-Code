export interface NotificationPreferenceEntity {
  id: string;
  customerId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  transactionAlertsEnabled: boolean;
  transactionAlertsThreshold: number;
  transactionAlertsChannels: string[];
  paymentConfirmationsEnabled: boolean;
  paymentConfirmationsChannels: string[];
  monthlyStatementsEnabled: boolean;
  monthlyStatementsChannels: string[];
  marketingEmailsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
