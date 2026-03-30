import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  traceId: string;
  timestamp: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

export function getTraceId(): string {
  const context = getRequestContext();
  return context?.traceId || 'unknown';
}
