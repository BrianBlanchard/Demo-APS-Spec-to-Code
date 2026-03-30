import { z } from 'zod';

export const HealthStatusEnum = z.enum(['healthy', 'unhealthy']);

export const HealthResponseSchema = z.object({
  status: HealthStatusEnum,
  timestamp: z.string().datetime(),
  uptime: z.number(),
  database: z.object({
    connected: z.boolean(),
  }),
});

export type HealthStatus = z.infer<typeof HealthStatusEnum>;
export type HealthResponseDto = z.infer<typeof HealthResponseSchema>;
