export interface AuditLogEntry {
    action: string;
    accountId: string;
    details: Record<string, unknown>;
    success: boolean;
}
export interface IAuditService {
    log(entry: AuditLogEntry): void;
}
export declare class AuditService implements IAuditService {
    log(entry: AuditLogEntry): void;
    private maskAccountId;
    private maskSensitiveData;
}
//# sourceMappingURL=audit.service.d.ts.map