export interface RequestContext {
  traceId: string;
  userId?: string;
  userRole?: string;
  timestamp: Date;
}
