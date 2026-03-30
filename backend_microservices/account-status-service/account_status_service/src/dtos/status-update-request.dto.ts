import { z } from 'zod';
import { AccountStatus } from '../enums/account-status.enum';
import { StatusChangeReason } from '../enums/status-change-reason.enum';

export const StatusUpdateRequestSchema = z.object({
  newStatus: z.nativeEnum(AccountStatus),
  reason: z.nativeEnum(StatusChangeReason),
  notes: z.string().max(500).optional(),
  notifyCustomer: z.boolean(),
});

export type StatusUpdateRequest = z.infer<typeof StatusUpdateRequestSchema>;
