import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from '../types/request-context';

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function setContext(context: RequestContext): void {
  asyncLocalStorage.enterWith(context);
}

export function getContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

export function runWithContext<T>(context: RequestContext, callback: () => T): T {
  return asyncLocalStorage.run(context, callback);
}
