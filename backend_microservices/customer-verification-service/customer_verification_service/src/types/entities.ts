import {
  VerificationTypeValue,
  VerificationStatusValue,
  CheckResultValue,
  PriorityValue,
  ApprovalStatusValue,
  CheckTypeValue,
  CheckStatusValue,
} from './enums';

export interface VerificationRecord {
  verificationId: string;
  customerId: string;
  verificationType: VerificationTypeValue;
  status: VerificationStatusValue;
  overallResult?: CheckResultValue;
  initiatedAt: Date;
  completedAt?: Date;
  priority: PriorityValue;
  manualReviewRequired: boolean;
  approvalStatus: ApprovalStatusValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationCheck {
  checkId: string;
  verificationId: string;
  checkType: CheckTypeValue;
  status: CheckStatusValue;
  result?: CheckResultValue;
  details: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  customerId: string;
  ssn?: string;
  dateOfBirth?: Date;
  governmentId?: string;
  governmentIdType?: string;
  governmentIdState?: string;
  address?: Record<string, unknown>;
  ficoScore?: number;
  verificationStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}
