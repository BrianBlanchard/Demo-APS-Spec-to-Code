export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  CSR = 'CSR',
  CUSTOMER = 'CUSTOMER',
}

export interface AccountDTO {
  accountId: string;
  status: string;
  balance: number;
}

export interface CustomerDTO {
  customerId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  governmentId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone1: string;
  phone2?: string;
  eftAccountId: string;
  isPrimaryCardholder: boolean;
  ficoScore?: number;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  accounts?: AccountDTO[];
}

export interface UpdateCustomerRequestDTO {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone1?: string;
  phone2?: string;
}

export interface UpdateCustomerResponseDTO {
  customerId: string;
  updatedFields: string[];
  updatedAt: string;
  updatedBy: string;
}

export interface ErrorResponseDTO {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId?: string;
  details?: Record<string, string>;
}

export interface HealthCheckResponseDTO {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  dependencies: {
    database: string;
    redis: string;
  };
}

export interface UserContext {
  userId: string;
  role: UserRole;
  customerId?: string;
  ipAddress: string;
  traceId: string;
}
