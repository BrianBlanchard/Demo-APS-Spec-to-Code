import { z } from 'zod';
import { SuspensionReason } from './types';

/**
 * Request and Response DTOs with Zod validation schemas
 */

// Suspend User Request
export const SuspendUserRequestSchema = z.object({
  suspension_reason: z.nativeEnum(SuspensionReason),
  suspension_notes: z.string().min(1).max(1000),
  duration_days: z.number().int().positive().nullable(),
  notify_user: z.boolean(),
});

export type SuspendUserRequest = z.infer<typeof SuspendUserRequestSchema>;

// Suspend User Response
export interface SuspendUserResponse {
  success: boolean;
  message: string;
  user_id: string;
  suspended_until: Date | null;
}

// Standard Error Response
export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
}

// Health Check Response
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  checks: {
    database: 'up' | 'down';
  };
}
