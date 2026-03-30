import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  errorCode: z.string().min(1),
  message: z.string().min(1),
  timestamp: z.string().datetime(),
  traceId: z.string().min(1),
});

export type ErrorResponseDto = z.infer<typeof ErrorResponseSchema>;
