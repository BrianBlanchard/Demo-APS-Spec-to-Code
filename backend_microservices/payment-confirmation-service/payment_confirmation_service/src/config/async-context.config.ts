import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from '../types/context.types';

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const setRequestContext = (context: RequestContext): void => {
  asyncLocalStorage.enterWith(context);
};

export const getRequestContext = (): RequestContext | undefined => {
  return asyncLocalStorage.getStore();
};

export { asyncLocalStorage };
