export interface CreateCustomerRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  governmentId: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone1: string;
  phone2?: string;
  eftAccountId?: string;
  isPrimaryCardholder: boolean;
  ficoScore: number;
}

export interface CreateCustomerResponse {
  customerId: string;
  status: CustomerStatus;
  createdAt: string;
  verificationStatus: VerificationStatus;
  creditLimit: number;
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  MANUAL_REVIEW_REQUIRED = 'manual_review_required',
}

export interface Customer {
  customerId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: Date;
  ssn: string;
  governmentId: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone1: string;
  phone2?: string;
  eftAccountId?: string;
  isPrimaryCardholder: boolean;
  ficoScore: number;
  status: CustomerStatus;
  verificationStatus: VerificationStatus;
  creditLimit: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}
