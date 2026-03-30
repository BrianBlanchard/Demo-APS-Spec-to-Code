import { Knex } from 'knex';
import { AuditLogEntity } from '../types/entities';

export interface IAuditRepository {
  create(auditLog: AuditLogEntity): Promise<void>;
  createBatch(auditLogs: AuditLogEntity[]): Promise<void>;
}

export class AuditRepository implements IAuditRepository {
  constructor(private readonly db: Knex) {}

  async create(auditLog: AuditLogEntity): Promise<void> {
    await this.db<AuditLogEntity>('audit_logs').insert(auditLog);
  }

  async createBatch(auditLogs: AuditLogEntity[]): Promise<void> {
    if (auditLogs.length === 0) {
      return;
    }
    await this.db<AuditLogEntity>('audit_logs').insert(auditLogs);
  }
}
