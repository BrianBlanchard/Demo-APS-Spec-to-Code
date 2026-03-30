import { Pool } from 'pg';
import { AuditAction, AuditEntityType } from '../types/enums';

export interface CreateAuditLogData {
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  user_id: string | null;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  source: string;
  ip_address: string | null;
}

export interface AuditRepository {
  createAuditLog(data: CreateAuditLogData): Promise<void>;
}

export class AuditRepositoryImpl implements AuditRepository {
  constructor(private readonly pool: Pool) {}

  async createAuditLog(data: CreateAuditLogData): Promise<void> {
    const query = `
      INSERT INTO audit_logs (
        action, entity_type, entity_id, user_id, field_name,
        old_value, new_value, source, ip_address, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `;

    const values = [
      data.action,
      data.entity_type,
      data.entity_id,
      data.user_id,
      data.field_name,
      data.old_value,
      data.new_value,
      data.source,
      data.ip_address,
    ];

    await this.pool.query(query, values);
  }
}
