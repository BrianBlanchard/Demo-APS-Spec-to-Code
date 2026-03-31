import { AccountBalance, BalanceUpdateRequest, BalanceUpdateResponse } from '../types/account.types';
import { IAccountBalanceRepository } from '../repositories/account-balance.repository';
import { ICacheRepository } from '../repositories/cache.repository';
import { IAuditService } from './audit.service';
import { IEventService } from './event.service';
export interface IAccountBalanceService {
    getBalance(accountId: string): Promise<AccountBalance>;
    updateBalance(accountId: string, request: BalanceUpdateRequest): Promise<BalanceUpdateResponse>;
}
export declare class AccountBalanceService implements IAccountBalanceService {
    private readonly repository;
    private readonly cache;
    private readonly auditService;
    private readonly eventService;
    constructor(repository: IAccountBalanceRepository, cache: ICacheRepository, auditService: IAuditService, eventService: IEventService);
    getBalance(accountId: string): Promise<AccountBalance>;
    updateBalance(accountId: string, request: BalanceUpdateRequest): Promise<BalanceUpdateResponse>;
}
//# sourceMappingURL=account-balance.service.d.ts.map