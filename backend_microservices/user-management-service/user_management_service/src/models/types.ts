/**
 * Core types and enums for the User Management Service
 */

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum SuspensionReason {
  FRAUD = 'fraud',
  POLICY_VIOLATION = 'policy_violation',
  SPAM = 'spam',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SECURITY_CONCERN = 'security_concern',
  OTHER = 'other',
}

export enum AdminAction {
  SUSPEND_USER = 'suspend_user',
  REACTIVATE_USER = 'reactivate_user',
  DELETE_USER = 'delete_user',
  CHANGE_ROLE = 'change_role',
  IMPERSONATE_USER = 'impersonate_user',
  BULK_IMPORT = 'bulk_import',
  BULK_EXPORT = 'bulk_export',
}

export interface User {
  user_id: string;
  email: string;
  status: UserStatus;
  suspension_reason: SuspensionReason | null;
  suspension_notes: string | null;
  suspension_expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminAuditLog {
  log_id: number;
  admin_id: string;
  action: AdminAction;
  target_user_id: string | null;
  details_json: Record<string, unknown> | null;
  ip_address: string;
  created_at: Date;
}

export interface RequestContext {
  traceId: string;
  timestamp: Date;
  ipAddress: string;
  adminId?: string;
}
