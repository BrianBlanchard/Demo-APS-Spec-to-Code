export enum AccountStatus {
  NEW = 'NEW',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum AccountType {
  STANDARD_CREDIT = 'STANDARD_CREDIT',
  PREMIUM_CREDIT = 'PREMIUM_CREDIT',
  PROMOTIONAL_6MONTH = 'PROMOTIONAL_6MONTH',
}

export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum AuditEntityType {
  ACCOUNT = 'ACCOUNT',
  CUSTOMER = 'CUSTOMER',
}
