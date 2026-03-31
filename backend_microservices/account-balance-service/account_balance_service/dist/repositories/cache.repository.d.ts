import { RedisClient } from '../config/redis';
import { AccountBalance } from '../types/account.types';
export interface ICacheRepository {
    getBalance(accountId: string): Promise<AccountBalance | null>;
    setBalance(accountId: string, balance: AccountBalance): Promise<void>;
    invalidateBalance(accountId: string): Promise<void>;
}
export declare class CacheRepository implements ICacheRepository {
    private readonly redis;
    constructor(redis: RedisClient);
    getBalance(accountId: string): Promise<AccountBalance | null>;
    setBalance(accountId: string, balance: AccountBalance): Promise<void>;
    invalidateBalance(accountId: string): Promise<void>;
}
//# sourceMappingURL=cache.repository.d.ts.map