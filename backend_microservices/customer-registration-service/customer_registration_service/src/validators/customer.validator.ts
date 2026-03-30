import { z } from 'zod';

export const createCustomerSchema = z.object({
  firstName: z.string().min(1).max(25),
  middleName: z.string().max(25).optional(),
  lastName: z.string().min(1).max(25),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/),
  governmentId: z.string().min(1).max(20),
  addressLine1: z.string().min(1).max(50),
  addressLine2: z.string().max(50).optional(),
  addressLine3: z.string().max(50).optional(),
  city: z.string().min(1).max(50),
  state: z.string().length(2),
  zipCode: z.string().min(5).max(10),
  country: z.string().length(3),
  phone1: z.string().min(10).max(15),
  phone2: z.string().min(10).max(15).optional(),
  eftAccountId: z.string().max(20).optional(),
  isPrimaryCardholder: z.boolean(),
  ficoScore: z.number().int().min(300).max(850),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
