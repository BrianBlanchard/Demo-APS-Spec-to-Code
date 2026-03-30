export interface RequestContext {
  traceId: string;
  userId: string;
  role: string;
  ipAddress: string;
  timestamp: Date;
}
