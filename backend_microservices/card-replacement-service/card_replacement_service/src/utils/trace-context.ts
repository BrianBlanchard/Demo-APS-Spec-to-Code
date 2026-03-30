import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

interface TraceContext {
  traceId: string;
  userId?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<TraceContext>();

export function initTraceContext(traceId?: string, userId?: string): void {
  const context: TraceContext = {
    traceId: traceId || randomUUID(),
    userId,
  };
  asyncLocalStorage.enterWith(context);
}

export function getTraceId(): string {
  const context = asyncLocalStorage.getStore();
  return context?.traceId || 'unknown';
}

export function getUserId(): string | undefined {
  const context = asyncLocalStorage.getStore();
  return context?.userId;
}

export function runWithContext<T>(traceId: string, userId: string | undefined, fn: () => T): T {
  const context: TraceContext = { traceId, userId };
  return asyncLocalStorage.run(context, fn);
}
