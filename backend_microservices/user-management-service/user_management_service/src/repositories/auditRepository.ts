import { Knex } from 'knex';
import { AdminAuditLog, AdminAction } from '../models/types';
import { logger } from '../config/logger';
import { DatabaseError } from '../utils/errors';

export interface IAuditRepository {
  createAuditLog(
    adminId: string,
    action: AdminAction,
    targetUserId: string | null,
    detailsJson: Record<string, unknown> | null,
    ipAddress: string
  ): Promise<AdminAuditLog>;
}

export class AuditRepository implements IAuditRepository {
  private readonly tableName = 'admin_audit_log';

  constructor(private readonly db: Knex) {}

  async createAuditLog(
    adminId: string,
    action: AdminAction,
    targetUserId: string | null,
    detailsJson: Record<string, unknown> | null,
    ipAddress: string
  ): Promise<AdminAuditLog> {
    try {
      const auditLogs = await this.db<AdminAuditLog>(this.tableName)
        .insert({
          admin_id: adminId,
          action,
          target_user_id: targetUserId,
          details_json: detailsJson as unknown as Record<string, unknown> | null,
          ip_address: ipAddress,
          created_at: this.db.fn.now(),
        })
        .returning('*');

      if (!auditLogs || auditLogs.length === 0) {
        throw new Error('Failed to create audit log');
      }

      logger.info({ auditLog: auditLogs[0] }, 'Audit log created');
      return auditLogs[0];
    } catch (error) {
      logger.error({ error, adminId, action }, 'Error creating audit log');
      throw new DatabaseError('Failed to create audit log');
    }
  }
}
