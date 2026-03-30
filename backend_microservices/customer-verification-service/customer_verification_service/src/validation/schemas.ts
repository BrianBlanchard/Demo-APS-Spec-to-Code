import { z } from 'zod';
import {
  VerificationType,
  Priority,
  GovernmentIdType,
} from '../types/enums';

export const addressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
});

export const verificationDataSchema = z.object({
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format xxx-xx-xxxx'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in format YYYY-MM-DD'),
  governmentId: z.string().min(1, 'Government ID is required').max(20),
  governmentIdType: z.enum([
    GovernmentIdType.DRIVERS_LICENSE,
    GovernmentIdType.PASSPORT,
    GovernmentIdType.STATE_ID,
    GovernmentIdType.MILITARY_ID,
  ]),
  governmentIdState: z.string().length(2, 'Government ID state must be 2 characters'),
  address: addressSchema,
});

export const initiateVerificationRequestSchema = z.object({
  customerId: z.string().length(9, 'Customer ID must be exactly 9 characters'),
  verificationType: z.enum([
    VerificationType.FULL,
    VerificationType.PARTIAL,
    VerificationType.UPDATE,
  ]),
  verificationData: verificationDataSchema,
  priority: z.enum([Priority.HIGH, Priority.MEDIUM, Priority.LOW]),
});

export type InitiateVerificationRequest = z.infer<typeof initiateVerificationRequestSchema>;
