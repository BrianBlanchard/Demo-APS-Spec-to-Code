import {
  VerificationTypeValue,
  PriorityValue,
  GovernmentIdTypeValue,
  VerificationStatusValue,
  CheckTypeValue,
  CheckStatusValue,
  CheckResultValue,
  ApprovalStatusValue,
} from './enums';

export interface AddressDto {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface VerificationDataDto {
  ssn: string;
  dateOfBirth: string;
  governmentId: string;
  governmentIdType: GovernmentIdTypeValue;
  governmentIdState: string;
  address: AddressDto;
}

export interface InitiateVerificationRequestDto {
  customerId: string;
  verificationType: VerificationTypeValue;
  verificationData: VerificationDataDto;
  priority: PriorityValue;
}

export interface CheckStatusDto {
  checkType: CheckTypeValue;
  status: CheckStatusValue;
  result?: CheckResultValue;
  details?: Record<string, unknown>;
}

export interface InitiateVerificationResponseDto {
  verificationId: string;
  customerId: string;
  status: VerificationStatusValue;
  initiatedAt: string;
  estimatedCompletion: string;
  checks: CheckStatusDto[];
}

export interface VerificationStatusResponseDto {
  verificationId: string;
  customerId: string;
  status: VerificationStatusValue;
  completedAt?: string;
  overallResult?: CheckResultValue;
  checks: CheckStatusDto[];
  manualReviewRequired: boolean;
  approvalStatus: ApprovalStatusValue;
}

export interface ErrorResponseDto {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
}
