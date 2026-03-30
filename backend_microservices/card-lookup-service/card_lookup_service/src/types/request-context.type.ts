import { UserRole } from './user-role.type';

export interface RequestContext {
  traceId: string;
  userId: string;
  userRole: UserRole;
  timestamp: Date;
}
