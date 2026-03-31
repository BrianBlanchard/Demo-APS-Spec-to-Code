import { Knex } from 'knex';
import { AccountBalanceEntity, BalanceHistoryEntity } from '../types/account.types';
export interface IAccountBalanceRepository {
    findByAccountId(accountId: string): Promise<AccountBalanceEntity | null>;
    updateBalance(accountId: string, amount: number, isDebit: boolean, transactionId: string, transactionType: string): Promise<{
        previous: number;
        current: number;
    }>;
    recordBalanceHistory(history: Omit<BalanceHistoryEntity, 'history_id'>): Promise<void>;
}
export declare class AccountBalanceRepository implements IAccountBalanceRepository {
    private readonly db;
    constructor(db: Knex);
    findByAccountId(accountId: string): Promise<AccountBalanceEntity | null>;
    updateBalance(accountId: string, amount: number, isDebit: boolean, transactionId: string, transactionType: string): Promise<{
        previous: number;
        current: number;
    }>;
    recordBalanceHistory(history: Omit<BalanceHistoryEntity, 'history_id'>, trx?: Knex.Transaction): Promise<void>;
}
//# sourceMappingURL=account-balance.repository.d.ts.map