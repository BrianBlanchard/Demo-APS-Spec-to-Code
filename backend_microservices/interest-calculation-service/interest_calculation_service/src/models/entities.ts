// Domain entities matching database schema

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export interface Account {
  id: bigint;
  accountId: string; // 11-digit account identifier
  status: AccountStatus;
  disclosureGroupId: bigint | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountBalance {
  id: bigint;
  accountId: bigint; // FK to accounts
  currentBalance: string; // DECIMAL stored as string for precision
  purchaseBalance: string;
  cashAdvanceBalance: string;
  lastInterestAmount: string | null;
  lastInterestDate: Date | null;
  version: bigint; // Optimistic locking
  updatedAt: Date;
}

export interface InterestCalculation {
  id?: bigint;
  accountId: bigint;
  calculationDate: Date;
  purchaseBalance: string;
  purchaseRate: string;
  purchaseInterest: string;
  cashAdvanceBalance: string;
  cashAdvanceRate: string;
  cashAdvanceInterest: string;
  totalInterest: string;
  minimumChargeApplied: boolean;
  appliedToAccount: boolean;
  calculatedAt: Date;
  calculatedBy: string;
}

export interface InterestRate {
  rateType: 'PURCHASE' | 'CASH_ADVANCE';
  rate: string; // Annual percentage rate (e.g., "18.990")
}
