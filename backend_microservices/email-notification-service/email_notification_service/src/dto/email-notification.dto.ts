import { z } from 'zod';

// Priority enum
export const EmailPriority = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low',
} as const;

export type EmailPriorityType = (typeof EmailPriority)[keyof typeof EmailPriority];

// Email Status enum
export const EmailStatus = {
  SENT: 'sent',
  FAILED: 'failed',
  QUEUED: 'queued',
  RETRYING: 'retrying',
} as const;

export type EmailStatusType = (typeof EmailStatus)[keyof typeof EmailStatus];

// Request DTO Schema
export const SendEmailRequestSchema = z.object({
  to: z.string().email('Invalid email format'),
  templateId: z.string().min(1, 'Template ID is required'),
  templateData: z.record(z.unknown()),
  priority: z
    .enum([EmailPriority.HIGH, EmailPriority.NORMAL, EmailPriority.LOW])
    .default(EmailPriority.NORMAL),
});

export type SendEmailRequest = z.infer<typeof SendEmailRequestSchema>;

// Response DTO
export interface SendEmailResponse {
  notificationId: string;
  status: EmailStatusType;
  sentAt: string;
}

// Error Response DTO
export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId?: string;
}
