import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export interface RequestContext {
  traceId: string;
  userId?: string;
  ipAddress?: string;
  timestamp: Date;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

export function getTraceId(): string {
  const context = getRequestContext();
  return context?.traceId || 'unknown';
}

export function createRequestContext(userId?: string, ipAddress?: string): RequestContext {
  return {
    traceId: randomUUID(),
    userId,
    ipAddress,
    timestamp: new Date(),
  };
}
