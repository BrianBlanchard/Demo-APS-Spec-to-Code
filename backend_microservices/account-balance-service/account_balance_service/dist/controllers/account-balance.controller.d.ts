import { Router } from 'express';
import { IAccountBalanceService } from '../services/account-balance.service';
export declare class AccountBalanceController {
    private readonly service;
    router: Router;
    constructor(service: IAccountBalanceService);
    private initializeRoutes;
    private getBalance;
    private updateBalance;
}
//# sourceMappingURL=account-balance.controller.d.ts.map