import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

interface RequestContext {
  traceId: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const getTraceId = (): string => {
  const context = asyncLocalStorage.getStore();
  return context?.traceId || 'unknown';
};

export const runWithContext = <T>(fn: () => T): T => {
  const context: RequestContext = {
    traceId: randomUUID(),
  };
  return asyncLocalStorage.run(context, fn);
};

export const getContext = (): RequestContext | undefined => {
  return asyncLocalStorage.getStore();
};
