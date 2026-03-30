import { Knex } from 'knex';
import { AuditLog } from '../types/entities';

export interface IAuditRepository {
  create(auditLog: CreateAuditLogParams): Promise<AuditLog>;
}

export interface CreateAuditLogParams {
  eventType: string;
  entityType: string;
  entityId: string;
  userId: string;
  traceId: string;
  eventData: Record<string, unknown>;
}

export class AuditRepository implements IAuditRepository {
  constructor(private readonly db: Knex) {}

  async create(auditLog: CreateAuditLogParams): Promise<AuditLog> {
    const [row] = await this.db('audit_logs')
      .insert({
        event_type: auditLog.eventType,
        entity_type: auditLog.entityType,
        entity_id: auditLog.entityId,
        user_id: auditLog.userId,
        trace_id: auditLog.traceId,
        event_data: JSON.stringify(auditLog.eventData),
      })
      .returning('*');

    return this.mapRowToAuditLog(row);
  }

  private mapRowToAuditLog(row: Record<string, unknown>): AuditLog {
    return {
      id: row.id as string,
      eventType: row.event_type as string,
      entityType: row.entity_type as string,
      entityId: row.entity_id as string,
      userId: row.user_id as string,
      traceId: row.trace_id as string,
      eventData:
        typeof row.event_data === 'string'
          ? JSON.parse(row.event_data)
          : (row.event_data as Record<string, unknown>),
      timestamp: new Date(row.timestamp as string),
    };
  }
}
