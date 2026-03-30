import { z } from 'zod';

// Request DTO schemas
export const CalculateInterestRequestSchema = z.object({
  calculationDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsed <= today && !isNaN(parsed.getTime());
    },
    { message: 'Calculation date must not be a future date' },
  ),
  applyToAccount: z.boolean(),
});

export type CalculateInterestRequest = z.infer<typeof CalculateInterestRequestSchema>;

// Response DTOs
export interface CalculateInterestResponse {
  accountId: string;
  calculationDate: string;
  purchaseBalance: string;
  purchaseRate: string;
  purchaseInterest: string;
  purchaseInterestCalculation: string;
  cashAdvanceBalance: string;
  cashAdvanceRate: string;
  cashAdvanceInterest: string;
  cashAdvanceInterestCalculation: string;
  totalInterest: string;
  minimumChargeApplied: boolean;
  appliedToAccount: boolean;
  calculatedAt: string;
  calculatedBy: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  checks?: {
    database?: 'up' | 'down';
  };
}

// Error Response DTO
export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  traceId: string;
  reason?: string;
  accountId?: string;
  accountStatus?: string;
}
