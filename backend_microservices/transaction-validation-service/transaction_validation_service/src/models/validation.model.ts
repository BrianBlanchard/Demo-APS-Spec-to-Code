export enum ValidationResult {
  APPROVED = 'approved',
  DECLINED = 'declined',
}

export enum DeclineReason {
  INSUFFICIENT_CREDIT = 'insufficient_credit',
  CARD_INACTIVE = 'card_inactive',
  ACCOUNT_INACTIVE = 'account_inactive',
  INVALID_CVV = 'invalid_cvv',
  DUPLICATE_TRANSACTION = 'duplicate_transaction',
  DAILY_LIMIT_EXCEEDED = 'daily_limit_exceeded',
  INVALID_CARD = 'invalid_card',
  EXPIRED_CARD = 'expired_card',
}

export interface ValidationCheck {
  check: string;
  result: 'pass' | 'fail';
  details?: string;
}

export interface ValidationLog {
  validationId: string;
  cardNumber: string;
  accountId: string;
  amount: number;
  validationResult: ValidationResult;
  declineReason: DeclineReason | null;
  authorizationCode: string | null;
  merchantId: string;
  transactionType: string;
  validatedAt: Date;
  responseTimeMs: number;
  cvvProvided: boolean;
  cvvMatch: boolean | null;
}
