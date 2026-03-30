import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from '../types/request-context';

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

export function getTraceId(): string {
  const context = getRequestContext();
  return context?.traceId || 'no-trace-id';
}
