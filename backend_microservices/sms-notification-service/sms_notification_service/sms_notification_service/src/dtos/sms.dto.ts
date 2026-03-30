import { z } from 'zod';
import { MessageType, Priority, SmsStatus } from '../types/enums';

// Request Schema
export const SendSmsRequestSchema = z.object({
  to: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format (e.g., +13125550123)'),
  messageType: z.nativeEnum(MessageType),
  message: z.string().min(1, 'Message cannot be empty').max(1600, 'Message exceeds SMS limit'),
  priority: z.nativeEnum(Priority),
});

export type SendSmsRequest = z.infer<typeof SendSmsRequestSchema>;

// Response DTOs
export interface SendSmsResponse {
  notificationId: string;
  status: SmsStatus;
  sentAt: string;
  messageId: string;
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
}

// Domain Model
export interface SmsNotification {
  id?: number;
  notificationId: string;
  to: string;
  messageType: MessageType;
  message: string;
  priority: Priority;
  status: SmsStatus;
  messageId: string | null;
  sentAt: Date | null;
  failureReason: string | null;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}
