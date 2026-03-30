export interface CloseCycleRequest {
  billingCycleEnd: string;
  processingDate: string;
}

export interface CloseCycleResponse {
  billingCycle: string;
  accountsProcessed: number;
  totalInterestCharged: number;
  totalFeesCharged: number;
  statementsGenerated: number;
}

export interface Account {
  id: string;
  accountNumber: string;
  currentCycleCredit: number;
  currentCycleDebit: number;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  SUSPENDED = 'SUSPENDED',
}

export interface CycleArchive {
  id: string;
  accountId: string;
  billingCycle: string;
  cycleCredit: number;
  cycleDebit: number;
  interestCharged: number;
  feesCharged: number;
  processingDate: Date;
  createdAt: Date;
}

export interface ProcessingResult {
  accountId: string;
  interestCharged: number;
  feesCharged: number;
  success: boolean;
  error?: string;
}
