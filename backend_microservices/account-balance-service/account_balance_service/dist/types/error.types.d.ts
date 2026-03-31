export interface ErrorResponse {
    errorCode: string;
    message: string;
    timestamp: string;
    traceId: string;
}
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly errorCode: string;
    readonly isOperational: boolean;
    constructor(statusCode: number, errorCode: string, message: string, isOperational?: boolean);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class ResourceLockedError extends AppError {
    constructor(message?: string);
}
export declare class InternalServerError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=error.types.d.ts.map