import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from '../types/context.types';
import { randomUUID } from 'crypto';

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const getContext = (): RequestContext | undefined => {
  return asyncLocalStorage.getStore();
};

export const getTraceId = (): string => {
  const context = getContext();
  return context?.traceId || 'no-trace-id';
};

export const createContext = (traceId?: string): RequestContext => {
  return {
    traceId: traceId || randomUUID(),
    timestamp: new Date(),
  };
};
