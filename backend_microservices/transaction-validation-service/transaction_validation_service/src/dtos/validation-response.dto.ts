import { ValidationResult, DeclineReason, ValidationCheck } from '../models/validation.model';

export interface ValidationApprovedResponse {
  validationId: string;
  validationResult: ValidationResult.APPROVED;
  cardNumber: string;
  accountId: string;
  amount: number;
  availableCredit: number;
  remainingCreditAfter: number;
  authorizationCode: string;
  timestamp: string;
  validationChecks: ValidationCheck[];
}

export interface ValidationDeclinedResponse {
  validationId: string;
  validationResult: ValidationResult.DECLINED;
  declineReason: DeclineReason;
  declineReasonDescription: string;
  cardNumber: string;
  amount: number;
  availableCredit: number;
  timestamp: string;
  validationChecks: ValidationCheck[];
}

export type ValidationResponse = ValidationApprovedResponse | ValidationDeclinedResponse;

export const DeclineReasonDescriptions: Record<DeclineReason, string> = {
  [DeclineReason.INSUFFICIENT_CREDIT]: 'Transaction amount exceeds available credit',
  [DeclineReason.CARD_INACTIVE]: 'Card is suspended or cancelled',
  [DeclineReason.ACCOUNT_INACTIVE]: 'Account is closed or suspended',
  [DeclineReason.INVALID_CVV]: 'CVV does not match',
  [DeclineReason.DUPLICATE_TRANSACTION]: 'Possible duplicate transaction detected',
  [DeclineReason.DAILY_LIMIT_EXCEEDED]: 'Daily transaction limit reached',
  [DeclineReason.INVALID_CARD]: 'Card number is invalid or not found',
  [DeclineReason.EXPIRED_CARD]: 'Card is past expiration date',
};
