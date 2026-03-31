import { z } from 'zod';
import { TransactionType } from './account.types';
export declare const AccountIdParamSchema: z.ZodObject<{
    accountId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    accountId: string;
}, {
    accountId: string;
}>;
export declare const BalanceUpdateRequestSchema: z.ZodObject<{
    transactionId: z.ZodString;
    transactionType: z.ZodNativeEnum<typeof TransactionType>;
    amount: z.ZodNumber;
    isDebit: z.ZodBoolean;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    amount: number;
    transactionId: string;
    transactionType: TransactionType;
    isDebit: boolean;
}, {
    timestamp: string;
    amount: number;
    transactionId: string;
    transactionType: TransactionType;
    isDebit: boolean;
}>;
export type AccountIdParam = z.infer<typeof AccountIdParamSchema>;
export type BalanceUpdateRequestDto = z.infer<typeof BalanceUpdateRequestSchema>;
//# sourceMappingURL=dto.d.ts.map