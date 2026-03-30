export enum MessageType {
  FRAUD_ALERT = 'fraud_alert',
  OTP = 'otp',
  TRANSACTION_CONFIRMATION = 'transaction_confirmation',
  ACCOUNT_STATUS = 'account_status',
}

export enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum SmsStatus {
  SENT = 'sent',
  FAILED = 'failed',
  QUEUED = 'queued',
  OPTED_OUT = 'opted_out',
}
