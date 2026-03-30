import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  traceId: string;
  timestamp: string;
}

export const asyncContext = new AsyncLocalStorage<RequestContext>();

export function getTraceId(): string {
  const context = asyncContext.getStore();
  return context?.traceId || 'unknown';
}

export function getTimestamp(): string {
  const context = asyncContext.getStore();
  return context?.timestamp || new Date().toISOString();
}
