import { z } from 'zod';

export const CreateCardSchema = z.object({
  cardNumber: z
    .string()
    .length(16, 'Card number must be exactly 16 digits')
    .regex(/^\d{16}$/, 'Card number must contain only digits'),
  accountId: z
    .string()
    .length(11, 'Account ID must be exactly 11 digits')
    .regex(/^\d{11}$/, 'Account ID must contain only digits'),
  embossedName: z
    .string()
    .max(26, 'Embossed name exceeds 26 character limit')
    .regex(/^[A-Z0-9 -]*$/, 'Embossed name can only contain A-Z, 0-9, space, and hyphen')
    .optional(),
  expirationYears: z.number().int().min(1).max(5).default(3),
});

export type CreateCardDto = z.infer<typeof CreateCardSchema>;
