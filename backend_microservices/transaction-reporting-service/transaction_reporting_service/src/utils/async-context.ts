import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  traceId: string;
  timestamp: Date;
}

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function getContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

export function getTraceId(): string {
  const context = getContext();
  return context?.traceId || 'unknown';
}

export function runWithContext<T>(context: RequestContext, callback: () => T): T {
  return asyncLocalStorage.run(context, callback);
}
