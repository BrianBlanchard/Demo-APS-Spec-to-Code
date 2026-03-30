export const VerificationType = {
  FULL: 'full',
  PARTIAL: 'partial',
  UPDATE: 'update',
} as const;

export type VerificationTypeValue = typeof VerificationType[keyof typeof VerificationType];

export const CheckType = {
  CREDIT_BUREAU: 'credit_bureau',
  GOVERNMENT_ID: 'government_id',
  FRAUD_DETECTION: 'fraud_detection',
  ADDRESS_VERIFICATION: 'address_verification',
} as const;

export type CheckTypeValue = typeof CheckType[keyof typeof CheckType];

export const VerificationStatus = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type VerificationStatusValue = typeof VerificationStatus[keyof typeof VerificationStatus];

export const CheckStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SERVICE_UNAVAILABLE: 'service_unavailable',
} as const;

export type CheckStatusValue = typeof CheckStatus[keyof typeof CheckStatus];

export const CheckResult = {
  PASSED: 'passed',
  FAILED: 'failed',
  REVIEW_REQUIRED: 'review_required',
} as const;

export type CheckResultValue = typeof CheckResult[keyof typeof CheckResult];

export const Priority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type PriorityValue = typeof Priority[keyof typeof Priority];

export const ApprovalStatus = {
  AUTO_APPROVED: 'auto_approved',
  DECLINED_CREDIT: 'declined_credit',
  PENDING_DOCUMENTS: 'pending_documents',
  PENDING_REVIEW: 'pending_review',
  SUSPENDED: 'suspended',
} as const;

export type ApprovalStatusValue = typeof ApprovalStatus[keyof typeof ApprovalStatus];

export const GovernmentIdType = {
  DRIVERS_LICENSE: 'drivers_license',
  PASSPORT: 'passport',
  STATE_ID: 'state_id',
  MILITARY_ID: 'military_id',
} as const;

export type GovernmentIdTypeValue = typeof GovernmentIdType[keyof typeof GovernmentIdType];
