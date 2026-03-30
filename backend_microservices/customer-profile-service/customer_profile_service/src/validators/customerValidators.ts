import { z } from 'zod';

export const updateCustomerSchema = z.object({
  addressLine1: z.string().max(50).optional(),
  addressLine2: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().max(10).optional(),
  phone1: z.string().max(15).regex(/^\d{3}-\d{3}-\d{4}$/).optional(),
  phone2: z.string().max(15).regex(/^\d{3}-\d{3}-\d{4}$/).optional(),
});

export const customerIdParamSchema = z.object({
  customerId: z.string().regex(/^\d{9}$/),
});

export const getCustomerQuerySchema = z.object({
  includeAccounts: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  includeCards: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
});
