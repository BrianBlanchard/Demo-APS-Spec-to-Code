import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        accountId?: string;
        role?: string;
    };
}
export declare const jwtAuthMiddleware: (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const internalServiceAuthMiddleware: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map