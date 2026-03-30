import { z } from 'zod';
import { AccountStatus, AccountType } from './enums';

// Request DTO
export const CreateAccountRequestSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  accountType: z.nativeEnum(AccountType, {
    errorMap: () => ({ message: 'Invalid account type' }),
  }),
  creditLimit: z.number().positive('Credit limit must be positive'),
  cashAdvanceLimit: z.number().positive('Cash advance limit must be positive'),
  disclosureGroupCode: z.string().min(1, 'Disclosure group code is required'),
});

export type CreateAccountRequest = z.infer<typeof CreateAccountRequestSchema>;

// Response DTO
export interface AccountResponse {
  id: number;
  accountId: string;
  customerId: string;
  status: AccountStatus;
  accountType: AccountType;
  creditLimit: number;
  cashAdvanceLimit: number;
  currentBalance: number;
  availableCredit: number;
  openingDate: string;
  expirationDate: string;
  disclosureGroupCode: string;
  createdAt: string;
  updatedAt: string;
}

// Error DTO
export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message?: string;
  timestamp: string;
  traceId?: string;
  errors?: ValidationError[];
  customerId?: string;
  disclosureGroupCode?: string;
  kycStatus?: string;
}

// Health Check DTO
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database?: 'connected' | 'disconnected';
}
