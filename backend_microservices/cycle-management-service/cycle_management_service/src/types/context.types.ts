export interface RequestContext {
  traceId: string;
  timestamp: Date;
  path?: string;
  method?: string;
}
